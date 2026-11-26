---
name: "BoseKit"
description: "Unofficial macOS menu bar app and Swift library for controlling Bose headphones and earbuds over Bluetooth."
href: "https://github.com/citrusinesis/BoseKit"
order: 1
role: "Personal project"
---

A macOS menu bar app and Swift library for controlling Bose headphones and earbuds over Bluetooth without the official Bose app.

Structured into `BoseKitEngine` (a Swift package covering the Bluetooth RFCOMM transport, protocol encoding, device profiles, and read-back verification for writes), `BoseKitProbe` (a CLI tool for inspecting device responses), and `BoseKit` (a SwiftUI menu bar app supporting English and Korean).

Supports listening modes, noise cancellation and ambient sound controls, equalizer adjustments, multipoint status, and device settings, verified on hardware with QuietComfort Ultra Headphones (1st Gen) with protocol details based on `bosectl`.
