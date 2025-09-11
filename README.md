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
npm install svelte-ag-grid ag-grid-community @ag-grid-community/styles
```

```bash
pnpm add svelte-ag-grid ag-grid-community @ag-grid-community/styles
```

```bash
bun add svelte-ag-grid ag-grid-community @ag-grid-community/styles
```

## Usage

### Basic Setup

```html
<script lang="ts">
	import { AgGrid, ModuleRegistry, AllCommunityModule } from 'svelte-ag-grid';

	// Register AG Grid modules (required)
	ModuleRegistry.registerModules([AllCommunityModule]);

	const rowData = [
		{ make: 'Toyota', model: 'Celica', price: 35000 },
		{ make: 'Ford', model: 'Mondeo', price: 32000 },
		{ make: 'Porsche', model: 'Boxster', price: 72000 }
	];

	const columnDefs = [
		{ field: 'make' }, 
		{ field: 'model' }, 
		{ field: 'price' }
	];
</script>

<div style="height: 400px;">
	<!-- Direct props (recommended) -->
	<AgGrid {rowData} {columnDefs} />
	
	<!-- Or spread an options object -->
	<!-- <AgGrid {...gridOptions} /> -->
</div>
```

### Prop Options

The AgGrid component accepts props in three flexible ways:

#### 1. Direct Props (Recommended)

```html
<AgGrid 
	rowData={myData} 
	columnDefs={columns}
	pagination={true}
	paginationPageSize={20}
	defaultColDef={{ sortable: true }}
/>
```

#### 2. Spread Options Object

```html
<script lang="ts">
	const gridOptions = {
		rowData: myData,
		columnDefs: columns,
		pagination: true,
		paginationPageSize: 20
	};
</script>

<AgGrid {...gridOptions} />
```

#### 3. Mixed Approach

```html
<AgGrid 
	{...baseGridOptions} 
	rowData={dynamicData}
	pagination={showPagination}
/>
```

**Note:** Direct props take precedence over spread options when both are provided.

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

<AgGrid rowData={data} columnDefs={cols} {params} />
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

The AgGrid component accepts all AG Grid options as direct props, plus:

| Prop     | Type         | Default | Description              |
| -------- | ------------ | ------- | ------------------------ |
| `params` | `GridParams` | `{}`    | Grid creation parameters |
| `api`    | `GridApi`    | -       | Bindable grid API        |

All AG Grid options can be passed as props (e.g., `rowData`, `columnDefs`, `pagination`, etc.)

#### TypeScript Support

All AG Grid options are available as properly typed props. For wrapper components, you have two type options:

**Option 1: Clean Types (No Snippets)**
```typescript
import type { AgGridProps } from 'svelte-ag-grid';

// Simple wrapper without snippet support
interface MyGridProps<T> extends Partial<AgGridProps<T>> {
	data: T[];
	title?: string;
}
```

**Option 2: Full Types (With Snippets)**
```typescript
import type { AgGridPropsWithSnippets } from 'svelte-ag-grid';

// Wrapper that supports snippet pass-through
interface MyGridProps<T> extends Partial<AgGridPropsWithSnippets<T>> {
	data: T[];
	title?: string;
}
```

Example wrapper with snippet support:
```html
<!-- MyGrid.svelte -->
<script lang="ts" generics="T">
	import { AgGrid, type AgGridPropsWithSnippets } from 'svelte-ag-grid';
	
	interface Props extends Partial<AgGridPropsWithSnippets<T>> {
		data: T[];
		title?: string;
	}
	
	let { data, title, ...gridProps }: Props = $props();
	
	const defaults = {
		pagination: true,
		paginationPageSize: 20,
		defaultColDef: { sortable: true, filter: true }
	};
</script>

<h2>{title}</h2>
<AgGrid {...defaults} {...gridProps} rowData={data}>
	{@render children?.()}
</AgGrid>
```

Then use with snippets:
```html
<MyGrid {data} title="My Data" columnDefs={cols}>
	{#snippet score(props)}
		<span class="score">{props.params.value}</span>
	{/snippet}
	{#snippet name(props)}
		<strong>{props.params.value}</strong>
	{/snippet}
</MyGrid>
```

#### Prop Precedence

When using both spread syntax and direct props:

```html
<AgGrid 
	{...baseOptions}        <!-- Applied first -->
	rowData={dynamicData}   <!-- Overrides baseOptions.rowData -->
	pagination={true}       <!-- Overrides baseOptions.pagination -->
/>
```

Direct props take precedence over spread options, allowing you to override specific values while keeping defaults.

## Svelte Cell Renderers

This library provides three ways to create custom cell renderers:

### 🎯 Inline Snippets (Recommended)

The easiest and most powerful way is to use **inline snippets** directly inside the `<AgGrid>` component. Simply define snippets with names matching your column field names:

```html
<script lang="ts">
	import { AgGrid } from 'svelte-ag-grid';
	import type { GridOptions } from 'ag-grid-community';

	interface Person {
		name: string;
		age: number;
		score: number;
		status: 'active' | 'inactive';
	}

	const columnDefs = [
		{ field: 'name', headerName: 'Name' },
		{ field: 'age', headerName: 'Age' },
		{ field: 'score', headerName: 'Score' }, // Will use score snippet
		{ field: 'status', headerName: 'Status' } // Will use status snippet
	];

	const rowData: Person[] = [
		{ name: 'Alice', age: 25, score: 95, status: 'active' },
		{ name: 'Bob', age: 30, score: 87, status: 'inactive' },
		{ name: 'Charlie', age: 35, score: 92, status: 'active' }
	];
</script>

<div style="height: 400px;">
	<AgGrid {rowData} {columnDefs}>
		<!-- Snippet name must match column field name -->
		{#snippet score(props)}
		<div class="score-cell">
			<span
				class="score-value {props.params.value >= 90 ? 'excellent' : props.params.value >= 80 ? 'good' : 'okay'}"
			>
				{props.params.value}
			</span>
			<div class="score-bar">
				<div class="score-fill" style="width: {props.params.value}%"></div>
			</div>
		</div>
		{/snippet} {#snippet status(props)}
		<span class="status-badge {props.params.value}"> {props.params.value} </span>
		{/snippet}
	</AgGrid>
</div>

<style>
	:global(.score-cell) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	:global(.score-value.excellent) {
		color: #16a34a;
	}
	:global(.score-value.good) {
		color: #2563eb;
	}
	:global(.score-value.okay) {
		color: #ea580c;
	}

	:global(.score-bar) {
		flex: 1;
		height: 4px;
		background-color: #e5e7eb;
		border-radius: 2px;
		overflow: hidden;
	}

	:global(.score-fill) {
		height: 100%;
		background: linear-gradient(90deg, #ea580c 0%, #2563eb 50%, #16a34a 100%);
		transition: width 0.3s ease;
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

**Benefits of inline snippets:**

- ✅ Fully type-safe - snippet names must match field names
- ✅ No manual cell renderer setup required
- ✅ Clean, declarative syntax
- ✅ Automatic integration with AG Grid

**Important Notes:**

- Snippet names must match your column field names exactly
- Field names that conflict with component props (`options`, `params`, `api`) cannot be used as snippet names
- Snippets receive `props.params` containing AG Grid's `ICellRendererParams`

### External Snippet Renderer

Use `makeSvelteSnippetRenderer` for snippets defined outside the grid:

```html
<script lang="ts">
	import { AgGrid, makeSvelteSnippetRenderer } from 'svelte-ag-grid';

	const columnDefs = [
		{ field: 'name' },
		{
			field: 'price',
			cellRenderer: makeSvelteSnippetRenderer(priceCell, (params) => ({
				price: params.value
			}))
		}
	];

	const rowData = [
		{ name: 'Product A', price: 99.99 },
		{ name: 'Product B', price: 149.99 }
	];
</script>

{#snippet priceCell(params: { price: number })}
<span class="price {params.price > 100 ? 'expensive' : 'affordable'}">
	${params.price.toFixed(2)}
</span>
{/snippet}

<AgGrid {rowData} {columnDefs} />
```

### Component Renderer

Use `makeSvelteCellRenderer` for reusable Svelte components:

```html
<script lang="ts">
	import { AgGrid, makeSvelteCellRenderer } from 'svelte-ag-grid';
	import MyButton from './MyButton.svelte';

	const ButtonRenderer = makeSvelteCellRenderer(MyButton, (params) => ({
		label: params.value,
		onclick: () => console.log('Clicked:', params.data)
	}));

	const columnDefs = [
		{ field: 'name' },
		{
			field: 'action',
			cellRenderer: ButtonRenderer
		}
	];

	const rowData = [
		{ name: 'Item 1', action: 'Edit' },
		{ name: 'Item 2', action: 'Delete' }
	];
</script>

<AgGrid {rowData} {columnDefs} />
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
