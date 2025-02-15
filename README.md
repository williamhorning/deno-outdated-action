# Deno Outdated Action

This action checks if the dependencies in your Deno project are outdated.

## Usage

```yaml
jobs:
  update:
    run-on: ubuntu-latest
    steps:
      - uses: williamhorning/deno-outdated-action@v1
        with:
          branch_name: "chore/deps-update"
          commit_message: "chore(deps): update Deno dependencies"
          deno_version: "2.x"
          pull_request_title: "chore(deps): update Deno dependencies"
```

## Inputs

### `branch_name`

Branch name to use when making a pull request. Defaults to `chore/deps-update`.

### `commit_message`

Commit message to use when making a pull request. Defaults to
`chore(deps): update Deno dependencies`.

### `deno_version`

Deno version to use. Defaults to `2.x`. See
[denoland/setup-deno](https://github.com/denoland/setup-deno) for accepted
values.

### `github_token`

GitHub token to use. Defaults to `${{ github.token }}`.

### `pull_request_title`

Pull request title to use. Defaults to `chore(deps): update Deno dependencies`.
