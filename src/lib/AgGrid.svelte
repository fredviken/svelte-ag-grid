<script lang="ts" generics="T">
	import { onMount, onDestroy } from 'svelte';
	import { watch } from 'runed';
	import { createGrid, type GridApi, type GridOptions, type GridParams } from 'ag-grid-community';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		options: GridOptions<T>;
		params?: GridParams;
		api?: GridApi<T>;
	}

	let { options, params = {}, api = $bindable(), ...rest }: Props = $props();

	let gridDiv: HTMLDivElement;

	// Watch for changes to specific reactive fields
	watch(
		() => options.rowData,
		(newRowData) => {
			if (api && newRowData !== undefined) {
				api.setGridOption('rowData', newRowData);
			}
		}
	);

	watch(
		() => options.columnDefs,
		(newColumnDefs) => {
			if (api && newColumnDefs !== undefined) {
				api.setGridOption('columnDefs', newColumnDefs);
			}
		}
	);

	watch(
		() => options.defaultColDef,
		(newDefaultColDef) => {
			if (api && newDefaultColDef !== undefined) {
				api.setGridOption('defaultColDef', newDefaultColDef);
			}
		}
	);

	watch(
		() => options.pagination,
		(newPagination) => {
			if (api && newPagination !== undefined) {
				api.setGridOption('pagination', newPagination);
			}
		}
	);

	watch(
		() => options.paginationPageSize,
		(newPageSize) => {
			if (api && newPageSize !== undefined) {
				api.setGridOption('paginationPageSize', newPageSize);
			}
		}
	);

	onMount(() => {
		api = createGrid(gridDiv, options, params);
	});

	onDestroy(() => {
		if (api) {
			api.destroy();
		}
		api = undefined;
	});
</script>

<div bind:this={gridDiv} {...rest}></div>
