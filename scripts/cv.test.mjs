import assert from "node:assert/strict";
import test from "node:test";
import { selectPrintProjects } from "../src/features/about/lib/projects.ts";
import { cvSchema } from "../src/features/about/lib/schema.ts";
import { selectVariants } from "../src/lib/i18n/content.ts";

const identity = { slug: "cv", lang: "en", name: "Test identity" };

test("identity-only CV does not fabricate section entries", () => {
	const cv = cvSchema.parse(identity);
	for (const key of [
		"experience",
		"education",
		"printProjects",
		"skills",
		"links",
		"awards",
		"certifications",
	])
		assert.deepEqual(cv[key], []);
	assert.equal(cv.email, undefined);
	assert.equal(cv.summary, undefined);
});

test("CV validates date precision, required career fields, email and public link protocols", () => {
	const job = {
		organization: "Test organization",
		role: "Test role",
		start: "2020-03",
	};
	assert.equal(
		cvSchema.safeParse({ ...identity, experience: [job] }).success,
		true,
	);
	for (const start of ["2020-13", "2020-00", "March 2020"]) {
		assert.equal(
			cvSchema.safeParse({ ...identity, experience: [{ ...job, start }] })
				.success,
			false,
		);
	}
	assert.equal(
		cvSchema.safeParse({ ...identity, experience: [{ start: "2020" }] })
			.success,
		false,
	);
	assert.equal(
		cvSchema.safeParse({ ...identity, email: "invalid" }).success,
		false,
	);
	assert.equal(
		cvSchema.safeParse({
			...identity,
			links: [{ label: "Unsafe", href: "javascript:alert(1)" }],
		}).success,
		false,
	);
});

test("current employment and semester graduation retain their stated precision", () => {
	const job = {
		organization: "Test organization",
		role: "Head",
		team: "Test team",
		start: "2026-01",
		current: true,
	};
	const parsed = cvSchema.parse({
		...identity,
		experience: [job],
		education: [
			{
				institution: "Test institution",
				qualification: "B.S.",
				expectedGraduation: { year: 2028, semester: 2 },
			},
		],
	});
	assert.equal(parsed.experience[0].end, undefined);
	assert.deepEqual(parsed.experience[0].responsibilities, []);
	assert.deepEqual(parsed.experience[0].achievements, []);
	assert.deepEqual(parsed.education[0].expectedGraduation, {
		year: 2028,
		semester: 2,
	});
	assert.equal(
		cvSchema.safeParse({
			...identity,
			experience: [{ ...job, end: "2026-12" }],
		}).success,
		false,
	);
	assert.equal(
		cvSchema.safeParse({
			...identity,
			education: [
				{
					institution: "X",
					qualification: "Y",
					expectedGraduation: { year: 2028, semester: 3 },
				},
			],
		}).success,
		false,
	);
});

test("career achievements require an action and accept evidence without inventing metrics", () => {
	const job = {
		organization: "Test organization",
		role: "Test role",
		start: "2026-01",
	};
	assert.equal(
		cvSchema.safeParse({
			...identity,
			experience: [{ ...job, achievements: [{ result: "Outcome only" }] }],
		}).success,
		false,
	);
	const parsed = cvSchema.parse({
		...identity,
		experience: [
			{
				...job,
				achievements: [
					{
						action: "Documented action",
						result: "Observed result",
						evidence: "Recorded measurement",
					},
				],
			},
		],
	});
	assert.deepEqual(parsed.experience[0].achievements[0].technologies, []);
	assert.equal(
		parsed.experience[0].achievements[0].evidence,
		"Recorded measurement",
	);
});

test("CV references resolve shared projects with locale fallback and explicit print order", () => {
	const project = (slug, lang) => ({
		id: `${slug}.${lang}.md`,
		data: { slug, lang, printSummary: ["Verified summary"] },
	});
	const entries = [
		project("first", "en"),
		project("first", "ko"),
		project("second", "ko"),
	];
	const cv = cvSchema.parse({
		...identity,
		printProjects: ["second", "first"],
	});
	const selected = selectPrintProjects(
		cv.printProjects,
		selectVariants(entries, "en"),
	);
	assert.deepEqual(
		selected.map(({ data }) => [data.slug, data.lang]),
		[
			["second", "ko"],
			["first", "en"],
		],
	);
	assert.equal(selected[0], entries[2]);
	assert.deepEqual(selectPrintProjects([], entries), []);
	assert.throws(() => selectPrintProjects(["missing"], entries), /not found/);
	assert.throws(
		() =>
			selectPrintProjects(
				["empty"],
				[{ data: { slug: "empty", printSummary: [] } }],
			),
		/requires printSummary/,
	);
	assert.equal(
		cvSchema.safeParse({ ...identity, printProjects: ["first", "first"] })
			.success,
		false,
	);
});

test("multi-role experience entries validate grouped roles and current-role constraints", () => {
	const grouped = {
		organization: "Test organization",
		start: "2026-01",
		current: true,
		roles: [
			{ role: "Lead", start: "2026-09", current: true },
			{ role: "Engineer", start: "2026-03", end: "2026-09" },
		],
	};
	const parsed = cvSchema.parse({ ...identity, experience: [grouped] });
	assert.equal(parsed.experience[0].roles.length, 2);
	assert.equal(parsed.experience[0].roles[0].end, undefined);
	assert.equal(
		cvSchema.safeParse({
			...identity,
			experience: [
				{
					...grouped,
					roles: [
						{ role: "Lead", start: "2026-09", end: "2026-10", current: true },
					],
				},
			],
		}).success,
		false,
	);
	assert.equal(
		cvSchema.safeParse({
			...identity,
			experience: [{ organization: "Test organization", start: "2026-01" }],
		}).success,
		false,
	);
});
