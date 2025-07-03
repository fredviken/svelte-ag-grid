<script lang="ts">
	import { AgGrid } from '$lib/index.js';
	import type { GridOptions } from 'ag-grid-community';
	import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
	import { onMount, onDestroy } from 'svelte';

	// Register all community features
	ModuleRegistry.registerModules([AllCommunityModule]);

	// Demo data with multiple fields to showcase inline snippets
	type Person = {
		id: number;
		name: string;
		age: number;
		score: number;
		status: 'active' | 'inactive' | 'pending';
		department: string;
	};

	let people = $state<Person[]>([
		{
			id: 1,
			name: 'Alice Johnson',
			age: 25,
			score: 95,
			status: 'active',
			department: 'Engineering'
		},
		{ id: 2, name: 'Bob Smith', age: 30, score: 87, status: 'inactive', department: 'Design' },
		{
			id: 3,
			name: 'Charlie Brown',
			age: 35,
			score: 92,
			status: 'pending',
			department: 'Marketing'
		},
		{ id: 4, name: 'Diana Prince', age: 28, score: 88, status: 'active', department: 'Engineering' }
	]);

	const columnDefs = [
		{ field: 'name' as const, headerName: 'Name', width: 150 },
		{ field: 'age' as const, headerName: 'Age', width: 80 },
		{ field: 'department' as const, headerName: 'Department', width: 120 },
		{ field: 'score' as const, headerName: 'Score', width: 200 },
		{ field: 'status' as const, headerName: 'Status', width: 120 }
	];

	let gridOptions: GridOptions<Person> = $derived({
		rowData: people,
		domLayout: 'autoHeight',
		columnDefs,
		defaultColDef: {
			flex: 1,
			sortable: true,
			filter: true
		}
	});

	// Demo functions
	function addPerson() {
		const names = ['David Wilson', 'Eve Chen', 'Frank Miller', 'Grace Lee', 'Henry Taylor'];
		const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR'];
		const statuses: Person['status'][] = ['active', 'inactive', 'pending'];

		const newPerson: Person = {
			id: Date.now(),
			name: names[Math.floor(Math.random() * names.length)],
			age: Math.floor(Math.random() * 40) + 20,
			score: Math.floor(Math.random() * 40) + 60,
			status: statuses[Math.floor(Math.random() * statuses.length)],
			department: departments[Math.floor(Math.random() * departments.length)]
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

<div class="container">
	<h1>Svelte AG Grid with Inline Snippets</h1>
	<p>
		This demo showcases inline snippets for cell rendering. Notice how the Score, Status, and
		Department columns use custom renderers defined as snippets directly inside the AgGrid
		component. Scores update every 2 seconds!
	</p>

	<div class="stats">
		<span>Total people: {people.length}</span>
		<span
			>Average score: {Math.round(
				people.reduce((sum, p) => sum + p.score, 0) / people.length
			)}</span
		>
	</div>

	<div class="grid-container">
		<AgGrid options={gridOptions}>
			<!-- Inline snippets automatically map to column fields -->
			{#snippet score(props)}
				<div class="score-cell">
					<span
						class="score-value {(props.params.value ?? 0) >= 90
							? 'excellent'
							: (props.params.value ?? 0) >= 80
								? 'good'
								: 'okay'}"
					>
						{props.params.value ?? 0}
					</span>
					<div class="score-bar">
						<div class="score-fill" style="width: {props.params.value ?? 0}%"></div>
					</div>
				</div>
			{/snippet}

			{#snippet status(props)}
				<span class="status-badge {props.params.value}">
					{props.params.value}
				</span>
			{/snippet}

			{#snippet department(props)}
				<div class="department-tag">
					<span class="dept-icon">
						{props.params.value === 'Engineering'
							? '⚙️'
							: props.params.value === 'Design'
								? '🎨'
								: props.params.value === 'Marketing'
									? '📈'
									: props.params.value === 'Sales'
										? '💼'
										: '👥'}
					</span>
					{props.params.value}
				</div>
			{/snippet}
		</AgGrid>
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

	/* Status badge styles */
	:global(.status-badge) {
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	:global(.status-badge.active) {
		background-color: #dcfce7;
		color: #166534;
	}

	:global(.status-badge.inactive) {
		background-color: #fef2f2;
		color: #991b1b;
	}

	:global(.status-badge.pending) {
		background-color: #fef3c7;
		color: #92400e;
	}

	/* Department tag styles */
	:global(.department-tag) {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.875rem;
	}

	:global(.dept-icon) {
		font-size: 1rem;
	}
</style>
