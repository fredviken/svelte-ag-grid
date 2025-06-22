# svelte-ag-grid

A reactive Svelte 5 wrapper for AG Grid with full TypeScript support.

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

## TypeScript

Full TypeScript support is included. The component uses AG Grid's types directly:

```typescript
import type { GridOptions, ColDef } from 'svelte-ag-grid';

const columnDefs: ColDef[] = [
	{ field: 'name', filter: true },
	{ field: 'age', sort: 'asc' }
];

const gridOptions: GridOptions = {
	columnDefs
	// Full intellisense for all AG Grid options
};
```

## AG Grid Documentation

For full AG Grid configuration options and features, see the official documentation:
https://www.ag-grid.com/javascript-data-grid/
