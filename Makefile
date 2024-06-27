.PHONY: check build

check:
	pnpm run typecheck
	pnpm run lint

build:
	pnpm run build
