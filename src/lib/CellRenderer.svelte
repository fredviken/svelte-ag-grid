<script lang="ts" generics="T extends Record<string, unknown>">
	import type { Snippet } from 'svelte';

	type Props<T> = {
		params: T;
		snippet: Snippet<[T]>;
	};

	let { snippet, params }: Props<T> = $props();
</script>

{@render snippet(params)}
