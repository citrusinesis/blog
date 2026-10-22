{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs.nixpkgs-lib.follows = "nixpkgs";
    };
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    git-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.treefmt-nix.flakeModule
        inputs.git-hooks.flakeModule
      ];

      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];

      perSystem =
        {
          config,
          lib,
          pkgs,
          ...
        }:
        {
          treefmt = {
            projectRootFile = "flake.nix";
            # Defined by hand rather than via `programs.biome`, which always passes `--config-path` to a Nix-generated config and would ignore the repo's biome.json that editors read.
            # `check --linter-enabled=false` formats and organizes imports without failing on lint diagnostics; linting runs as a separate hook.
            settings.formatter.biome = {
              command = lib.getExe pkgs.biome;
              options = [
                "check"
                "--write"
                "--linter-enabled=false"
                "--no-errors-on-unmatched"
              ];
              includes = [
                "*.js"
                "*.mjs"
                "*.cjs"
                "*.ts"
                "*.mts"
                "*.cts"
                "*.jsx"
                "*.tsx"
                "*.json"
                "*.jsonc"
                "*.css"
                "*.astro"
              ];
            };
            programs.nixfmt.enable = true;
          };

          pre-commit.settings.hooks = {
            treefmt.enable = true;
            biome-lint = {
              enable = true;
              name = "biome lint";
              entry = "${lib.getExe pkgs.biome} lint --no-errors-on-unmatched --error-on-warnings";
              types_or = [
                "javascript"
                "jsx"
                "ts"
                "tsx"
                "json"
                "css"
                "astro"
              ];
            };
            statix.enable = true;
            deadnix.enable = true;
            typos.enable = true;
            markdownlint = {
              enable = true;
              settings.configuration = {
                # Prose is written one sentence per line, so line length is not a meaningful signal.
                MD013 = false;
                # Posts legitimately use inline HTML such as <kbd>, <sup> and <mark>.
                MD033 = false;
                # Nothing formats Markdown, so aligned table pipes would have to be maintained by hand.
                MD060 = false;
                MD024.siblings_only = true;
                # Astro renders project names and post titles as the page H1.
                MD041.front_matter_title = "^\\s*(title|name)\\s*[:=]";
              };
            };
            # Needs node_modules, which the `nix flake check` sandbox lacks; pre-push keeps it out of the sandboxed run (default stage only) while still gating pushes.
            astro-check = {
              enable = true;
              name = "astro check";
              entry = "${lib.getExe pkgs.pnpm} exec astro check";
              pass_filenames = false;
              stages = [ "pre-push" ];
              files = "\\.(astro|ts|tsx|js|mjs|md|mdx)$";
            };
          };

          devShells.default = pkgs.mkShell {
            packages = [
              pkgs.nodejs_24
              pkgs.pnpm
              pkgs.biome
              config.treefmt.build.wrapper
              config.pre-commit.settings.package
            ]
            ++ config.pre-commit.settings.enabledPackages;
            shellHook = config.pre-commit.installationScript;
          };
        };
    };
}
