#!/bin/sh
set -eu

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  exit 0
fi

if git diff --cached --quiet --exit-code; then
  diff_output=$(git diff -- .)
  changed_files=$(git diff --name-only -- .)
else
  diff_output=$(git diff --cached -- .)
  changed_files=$(git diff --cached --name-only -- .)
fi

dependency_additions=$(printf "%s\n" "$diff_output" | awk '
  /^\+\+\+ b\// {
    file = $2
    sub(/^b\//, "", file)
    in_dependencies = 0
    next
  }
  file ~ /(^|\/)package\.json$/ && /^\+ *"(dependencies|devDependencies|peerDependencies|optionalDependencies)": *\{/ {
    in_dependencies = 1
    next
  }
  file ~ /(^|\/)package\.json$/ && in_dependencies && /^\+ *}/ {
    in_dependencies = 0
    next
  }
  file ~ /(^|\/)package\.json$/ && in_dependencies && /^\+.*"(@?[^"]+)": *"/ {
    print file ":" $0
  }
  file ~ /(^|\/)build\.gradle\.kts$/ && /^\+.*(implementation|api|runtimeOnly|testImplementation|testRuntimeOnly)\(/ {
    print file ":" $0
  }
')

if [ -n "$dependency_additions" ] && ! printf "%s\n" "$changed_files" | grep -qx "docs/10-tech-stack.md"; then
  printf "%s\n" "Ponytail gate failed: new dependencies need a purpose in docs/10-tech-stack.md."
  printf "%s\n" "$dependency_additions"
  exit 1
fi

printf "%s\n" "Ponytail gate passed."
