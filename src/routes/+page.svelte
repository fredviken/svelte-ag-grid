<script lang="ts">
	import { AgGrid, makeSvelteSnippetRenderer } from '$lib/index.js';
	import type { GridOptions } from 'ag-grid-community';
	import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
	import { onMount, onDestroy } from 'svelte';

	// Register all community features
	ModuleRegistry.registerModules([AllCommunityModule]);

	// Simple reactive data
	let people = $state([
		{ id: 1, name: 'Alice', age: 25, score: 85 },
		{ id: 2, name: 'Bob', age: 30, score: 92 },
		{ id: 3, name: 'Charlie', age: 35, score: 78 }
	]);

	const columnDefs = [
		{ field: 'name', headerName: 'Name' },
		{ field: 'age', headerName: 'Age' },
		{
			field: 'score',
			headerName: 'Score',
			cellRenderer: makeSvelteSnippetRenderer(scoreCell, (params) => ({
				score: params.value
			}))
		}
	];

	let gridOptions: GridOptions = $derived({
		rowData: people,
		domLayout: 'autoHeight',
		columnDefs,
		defaultColDef: {
			flex: 1,
			sortable: true,
			filter: true
		}
	});

	// Simple update functions
	function addPerson() {
		const names = ['David', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy'];
		const name = names[Math.floor(Math.random() * names.length)];
		const newPerson = {
			id: Date.now(),
			name,
			age: Math.floor(Math.random() * 40) + 20,
			score: Math.floor(Math.random() * 40) + 60
		};
		people = [...people, newPerson];
	}

	function updateRandomScore() {
		if (people.length === 0) return;
		const index = Math.floor(Math.random() * people.length);
		const updated = [...people];
		updated[index] = {
			...updated[index],
			score: Math.floor(Math.random() * 40) + 60
		};
		people = updated;
	}

	function removePerson() {
		if (people.length > 1) {
			people = people.slice(0, -1);
		}
	}

	// Auto-update scores every 2 seconds
	let interval: number;
	onMount(() => {
		interval = setInterval(updateRandomScore, 2000);
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});
</script>

<!-- Svelte snippet for score cell renderer -->
{#snippet scoreCell(params: { score: number })}
	<div class="score-cell">
		<span
			class="score-value {params.score >= 90 ? 'excellent' : params.score >= 80 ? 'good' : 'okay'}"
		>
			{params.score}
		</span>
		<div class="score-bar">
			<div class="score-fill" style="width: {params.score}%"></div>
		</div>
	</div>
{/snippet}

<div class="container">
	<h1>Svelte AG Grid Demo</h1>
	<p>This grid automatically updates when the data changes. Scores update every 2 seconds!</p>

	<div class="stats">
		<span>Total people: {people.length}</span>
		<span
			>Average score: {Math.round(
				people.reduce((sum, p) => sum + p.score, 0) / people.length
			)}</span
		>
	</div>

	<div class="grid-container">
		<AgGrid options={gridOptions} />
	</div>

	<div class="controls">
		<button onclick={addPerson}>Add Person</button>
		<button onclick={updateRandomScore}>Update Random Score</button>
		<button onclick={removePerson} disabled={people.length <= 1}>Remove Person</button>
	</div>
</div>

<style>
	.container {
		padding: 2rem;
		max-width: 800px;
		margin: 0 auto;
	}

	h1 {
		margin-bottom: 0.5rem;
	}

	p {
		margin-bottom: 2rem;
		color: #666;
	}

	.stats {
		display: flex;
		gap: 2rem;
		margin-bottom: 1rem;
		font-weight: 500;
		color: #333;
	}

	.grid-container {
		height: 300px;
		margin-bottom: 1rem;
	}

	.controls {
		display: flex;
		gap: 1rem;
	}

	button {
		padding: 0.5rem 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		background: white;
		cursor: pointer;
		transition: background 0.2s;
	}

	button:hover:not(:disabled) {
		background: #f5f5f5;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Score cell styles */
	:global(.score-cell) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0;
	}

	:global(.score-value) {
		font-weight: 600;
		min-width: 2rem;
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
</style>
