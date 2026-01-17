function run(
  cmd: string[],
  allowFail?: boolean,
): { ok: boolean; stdout: string } {
  const p = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    stdout: "piped",
    stderr: "piped",
  }).outputSync();

  const stdout = new TextDecoder().decode(p.stdout);

  if (!p.success && !allowFail) {
    throw new Error(
      `${cmd.join(" ")} failed:\n${new TextDecoder().decode(p.stderr)}`,
    );
  }

  return { ok: p.success, stdout };
}

function main() {
  Deno.env.set("NO_COLOR", "1");

  const summaryPath = Deno.env.get("GITHUB_STEP_SUMMARY");
  if (!summaryPath) {
    throw new Error("GITHUB_STEP_SUMMARY is not set");
  }

  const outdated = run(["deno", "outdated"], true);
  const report = ["```", outdated.stdout, "```"].join("\n");

  run(["deno", "outdated", "--update"], true);

  if (run(["git", "diff", "--quiet"], true).ok) {
    Deno.writeTextFileSync(
      summaryPath,
      "# Deno Outdated\n\nAll dependencies are up to date.\n",
    );
    return;
  }

  const summary = [
    "# Deno Outdated",
    "New versions detected and applied:",
    report,
  ].join("\n\n");
  Deno.writeTextFileSync(summaryPath, summary);

  run([
    "git",
    "config",
    "user.email",
    "github-actions[bot]@users.noreply.github.com",
  ]);
  run(["git", "config", "user.name", "github-actions[bot]"]);
  run(["git", "checkout", "-B", "chore/deps-update"]);
  run(["git", "add", "."]);
  run(["git", "commit", "-m", "chore(deps): update Deno dependencies"]);
  run(["git", "push", "-f", "origin", "chore/deps-update"]);

  const prExists = run(["gh", "pr", "view", "chore/deps-update"], true).ok;

  if (!prExists) {
    run([
      "gh",
      "pr",
      "create",
      "--title",
      "chore(deps): update Deno dependencies",
      "--body-file",
      summaryPath,
      "--head",
      "chore/deps-update",
    ]);
  } else {
    run(["gh", "pr", "edit", "chore/deps-update", "--body-file", summaryPath]);
  }
}

main();
