<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { watch } from 'runed';
	import {
		createGrid,
		type GridApi,
		type GridOptions,
		type GridParams
	} from 'ag-grid-community';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		options: GridOptions;
		params?: GridParams;
	}

	let { options, params = {}, ...rest }: Props = $props();

	let gridDiv: HTMLDivElement;
	let gridApi: GridApi | undefined;

	// Watch for changes to specific reactive fields
	watch(
		() => options.rowData,
		(newRowData) => {
			if (gridApi && newRowData !== undefined) {
				gridApi.setGridOption('rowData', newRowData);
			}
		}
	);

	watch(
		() => options.columnDefs,
		(newColumnDefs) => {
			if (gridApi && newColumnDefs !== undefined) {
				gridApi.setGridOption('columnDefs', newColumnDefs);
			}
		}
	);

	watch(
		() => options.defaultColDef,
		(newDefaultColDef) => {
			if (gridApi && newDefaultColDef !== undefined) {
				gridApi.setGridOption('defaultColDef', newDefaultColDef);
			}
		}
	);

	watch(
		() => options.pagination,
		(newPagination) => {
			if (gridApi && newPagination !== undefined) {
				gridApi.setGridOption('pagination', newPagination);
			}
		}
	);

	watch(
		() => options.paginationPageSize,
		(newPageSize) => {
			if (gridApi && newPageSize !== undefined) {
				gridApi.setGridOption('paginationPageSize', newPageSize);
			}
		}
	);

	onMount(() => {
		gridApi = createGrid(gridDiv, options, params);
	});

	onDestroy(() => {
		if (gridApi) {
			gridApi.destroy();
		}
	});
</script>

<div bind:this={gridDiv} {...rest}></div>
