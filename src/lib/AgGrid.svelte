<script lang="ts" generics="TData">
	import { onMount, onDestroy, type Snippet } from 'svelte';
	import { watch } from 'runed';
	import {
		createGrid,
		type GridApi,
		type GridOptions,
		type GridParams,
		type ICellRendererParams
	} from 'ag-grid-community';
	import type { HTMLAttributes } from 'svelte/elements';
	import { makeSvelteSnippetRenderer } from './SvelteCellRenderer.svelte.js';

	type Props = HTMLAttributes<HTMLDivElement> & {
		options: GridOptions<TData>;
		params?: GridParams;
		api?: GridApi<TData>;
	} & {
		[K in keyof TData]?: Snippet<[{ params: ICellRendererParams<TData, TData[K]> }]>;
	};

	let { options, params = {}, api = $bindable(), ...rest }: Props = $props();

	let gridDiv: HTMLDivElement;

	// Extract snippets from rest props - these are the field-named snippets
	const snippets = $derived(() => {
		const result: Record<string, Snippet> = {};
		if (options.rowData && options.rowData.length > 0) {
			const sampleRow = options.rowData[0];
			for (const key in sampleRow) {
				if (key in rest && typeof rest[key as keyof typeof rest] === 'function') {
					result[key] = rest[key as keyof typeof rest] as Snippet;
				}
			}
		}
		return result;
	});

	// Update column definitions to use snippets
	const enhancedOptions = $derived(() => {
		if (!options.columnDefs) return options;

		const updatedColumnDefs = options.columnDefs.map((colDef) => {
			if ('field' in colDef && colDef.field && snippets()[colDef.field]) {
				return {
					...colDef,
					cellRenderer: makeSvelteSnippetRenderer(snippets()[colDef.field], (params) => ({
						params
					}))
				};
			}
			return colDef;
		});

		return {
			...options,
			columnDefs: updatedColumnDefs
		};
	});

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
		() => enhancedOptions().columnDefs,
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
		api = createGrid(gridDiv, enhancedOptions(), params);
	});

	onDestroy(() => {
		if (api) {
			api.destroy();
		}
		api = undefined;
	});
</script>

<div bind:this={gridDiv} {...rest}></div>
