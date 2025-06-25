# svelte-ag-grid

A reactive Svelte 5 wrapper for [AG Grid](https://www.ag-grid.com/) with full TypeScript support.

## Features

- Simple, reactive API
- Fully typed using AG Grid's types
- Reactive updates for rowData, columnDefs, and more
- Minimal wrapper - AG Grid does the heavy lifting
- Flexible module system support

## Installation

```bash
npm install svelte-ag-grid ag-grid-community
```

```bash
pnpm add svelte-ag-grid ag-grid-community
```

```bash
bun add svelte-ag-grid ag-grid-community
```

## Usage

### Basic Setup

```html
<script lang="ts">
	import { AgGrid, ModuleRegistry, AllCommunityModule } from 'svelte-ag-grid';
	import type { GridOptions } from 'svelte-ag-grid';

	// Register AG Grid modules (required)
	ModuleRegistry.registerModules([AllCommunityModule]);

	const gridOptions: GridOptions = {
		rowData: [
			{ make: 'Toyota', model: 'Celica', price: 35000 },
			{ make: 'Ford', model: 'Mondeo', price: 32000 },
			{ make: 'Porsche', model: 'Boxster', price: 72000 }
		],
		columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }]
	};
</script>

<div style="height: 400px;">
	<AgGrid options="{gridOptions}" />
</div>
```

### Module Registration

AG Grid uses a modular architecture. You have several options:

#### Option 1: Register All Community Features (Simplest)

```javascript
import { ModuleRegistry, AllCommunityModule } from 'svelte-ag-grid';
ModuleRegistry.registerModules([AllCommunityModule]);
```

#### Option 2: Register Specific Modules (Smaller Bundle)

```javascript
import { ModuleRegistry } from 'svelte-ag-grid';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { CsvExportModule } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);
```

#### Option 3: Per-Grid Modules

```html
<script>
	import { AgGrid } from 'svelte-ag-grid';
	import { ClientSideRowModelModule, CsvExportModule } from 'ag-grid-community';
	import type { GridParams } from 'svelte-ag-grid';

	const params: GridParams = {
		modules: [ClientSideRowModelModule, CsvExportModule]
	};
</script>

<AgGrid options="{gridOptions}" {params} />
```

### Reactive Updates

The component automatically watches and updates these properties:

- `rowData`
- `columnDefs`
- `defaultColDef`
- `pagination`
- `paginationPageSize`

```html
<script lang="ts">
	let rowData = $state([...]);

	// This will automatically update the grid
	function addRow() {
		rowData = [...rowData, { make: 'BMW', model: 'M3', price: 65000 }];
	}
</script>
```

### Component Props

| Prop      | Type          | Default  | Description                  |
| --------- | ------------- | -------- | ---------------------------- |
| `options` | `GridOptions` | required | AG Grid configuration object |
| `params`  | `GridParams`  | `{}`     | Grid creation parameters     |

## Svelte Cell Renderers

This library provides two ways to render Svelte components in AG Grid cells:

### Component Renderer

Use `makeSvelteCellRenderer` to render a Svelte component in grid cells:

```html
<script lang="ts">
	import { AgGrid, makeSvelteCellRenderer } from 'svelte-ag-grid';
	import MyButton from './MyButton.svelte';

	interface RowData {
		name: string;
		value: number;
	}

	// Create a cell renderer that transforms AG Grid params to component props
	const ButtonRenderer = makeSvelteCellRenderer(MyButton, (params) => ({
		label: params.value,
		onClick: () => console.log('Clicked:', params.data)
	}));

	const gridOptions = {
		columnDefs: [
			{ field: 'name' },
			{
				field: 'value',
				cellRenderer: ButtonRenderer
			}
		],
		rowData: [
			{ name: 'Item 1', value: 100 },
			{ name: 'Item 2', value: 200 }
		]
	};
</script>
```

### Snippet Renderer

Use `makeSvelteSnippetRenderer` to render Svelte snippets defined in your markup:

```html
<script lang="ts">
	import { AgGrid, makeSvelteSnippetRenderer } from 'svelte-ag-grid';

	const gridOptions = {
		columnDefs: [
			{ field: 'name' },
			{ field: 'email' },
			{
				field: 'price',
				cellRenderer: makeSvelteSnippetRenderer(priceCell, (params) => ({
					price: params.value
				}))
			},
			{
				field: 'status',
				cellRenderer: makeSvelteSnippetRenderer(statusCell, (params) => ({
					status: params.value
				}))
			}
		],
		rowData: [
			{ name: 'John Doe', email: 'john@example.com', price: 99.99, status: 'active' },
			{ name: 'Jane Smith', email: 'jane@example.com', price: 149.99, status: 'inactive' }
		]
	};
</script>

<!-- Define snippets in your markup -->
{#snippet priceCell(params: { price: number })}
<span class="price {params.price > 100 ? 'expensive' : 'affordable'}">
	${params.price.toFixed(2)}
</span>
{/snippet} {#snippet statusCell(params: { status: string })}
<span class="status-badge {params.status}"> {params.status} </span>
{/snippet}

<div style="height: 400px;">
	<AgGrid options="{gridOptions}" />
</div>

<style>
	:global(.price.expensive) {
		color: #dc2626;
		font-weight: bold;
	}

	:global(.price.affordable) {
		color: #16a34a;
	}

	:global(.status-badge) {
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		text-transform: uppercase;
	}

	:global(.status-badge.active) {
		background-color: #dcfce7;
		color: #166534;
	}

	:global(.status-badge.inactive) {
		background-color: #fef2f2;
		color: #991b1b;
	}
</style>
```

### Props Transformer

Both renderers require a props transformer function that converts AG Grid's `ICellRendererParams` into the props your component or snippet expects:

```typescript
// The transformer receives AG Grid cell parameters
(params: ICellRendererParams) => {
	return {
		// Transform to your component's expected props
		value: params.value,
		data: params.data,
		isSelected: params.node.isSelected(),
		// Add any custom logic
		displayValue: params.value > 100 ? 'High' : 'Low'
	};
};
```

## AG Grid Documentation

For full AG Grid configuration options and features, see the official documentation:
https://www.ag-grid.com/javascript-data-grid/
