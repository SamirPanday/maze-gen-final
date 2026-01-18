import json
import os
import re
import matplotlib
# Force non-interactive backend to avoid window hanging
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from collections import defaultdict

def load_data(folder="metric_data/json"):
    data = []
    if not os.path.exists(folder):
        print(f"❌ Error: Folder '{folder}' not found.")
        return []
    
    for f in os.listdir(folder):
        if f.endswith(".json"):
            path = os.path.join(folder, f)
            try:
                with open(path, "r") as file:
                    content = json.load(file)
                    if isinstance(content, list):
                        data.extend(content)
                    else:
                        data.append(content)
            except Exception as e:
                print(f"⚠️ Could not read {path}: {e}")
    return data

def get_stats(data):
    # Group by (Algorithm, Type, Size)
    groups = defaultdict(list)
    for d in data:
        algo = d.get("algorithm", "Unknown")
        typ = d.get("type", "Unknown")
        size = d.get("mazeSize", "Unknown")
        groups[(algo, typ, size)].append(d)
    
    stats = {}
    for key, items in groups.items():
        times = [x["time"] for x in items if "time" in x]
        explored = [x["cellsExplored"] for x in items if "cellsExplored" in x]
        path = [x["pathLength"] for x in items if "pathLength" in x]
        dead_ends = [x["deadEnds"] for x in items if "deadEnds" in x]
        junctions = [x["junctions"] for x in items if "junctions" in x]
        
        stats[key] = {
            "avg_time": np.mean(times) if times else 0,
            "avg_explored": np.mean(explored) if explored else 0,
            "avg_path": np.mean(path) if path else 0,
            "avg_dead_ends": np.mean(dead_ends) if dead_ends else 0,
            "avg_junctions": np.mean(junctions) if junctions else 0,
            "count": len(items)
        }
    return stats

def sort_sizes(sizes):
    # Sort sizes like "10x10", "20x20" numerically
    return sorted(sizes, key=lambda s: int(re.search(r'\d+', s).group()) if re.search(r'\d+', s) else 0)

def generate_charts(stats):
    # Prepare data structures
    sizes = sort_sizes(list(set(k[2] for k in stats.keys())))
    
    # DEBUG: Print what we found
    print("\n🔍 DEBUG: Detected Algorithms & Types:")
    all_keys = list(set((k[0], k[1]) for k in stats.keys()))
    for algo, typ in sorted(all_keys):
        print(f"   - {algo} [{typ}]")

    # Filter for generators only
    generators_keywords = ["Backtracking", "Kruskal", "Prim", "Eller", "Wilson"]
    
    # Robust Filter: Check if name implies generator OR type is generator
    generators_list = sorted(list(set(k[0] for k in stats.keys() if k[1] == "generator" or any(gen in k[0] for gen in generators_keywords))))
    
    # Solvers are those that are 'solver' type AND not in the generators list
    solvers = sorted(list(set(k[0] for k in stats.keys() if k[1] == "solver" and k[0] not in generators_list)))
    
    print(f"\n✅ Solvers identified for charts: {solvers}")
    print(f"✅ Generators identified for charts: {generators_list}\n")
    
    # Color palette
    colors = ['#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#f1c40f', '#34495e']
    
    # ------------------------------------------------
    # 1. Efficiency Chart (Time vs Algorithm)
    # ------------------------------------------------
    plt.figure(figsize=(12, 6))
    bar_width = 0.2
    index = np.arange(len(sizes))
    
    for i, solver in enumerate(solvers):
        means = []
        for size in sizes:
            val = stats.get((solver, "solver", size), {}).get("avg_time", 0)
            means.append(val)
        
        plt.bar(index + i * bar_width, means, bar_width, label=solver, color=colors[i % len(colors)])

    plt.xlabel('Maze Size', fontsize=12, fontweight='bold')
    plt.ylabel('Average Time (seconds)', fontsize=12, fontweight='bold')
    plt.title('Solver Efficiency (Time vs Size)', fontsize=14, fontweight='bold')
    plt.xticks(index + bar_width * (len(solvers) - 1) / 2, sizes)
    plt.legend()
    plt.grid(True, axis='y', linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig('benchmark_chart_efficiency.png', dpi=300)
    plt.close()
    print("✅ Created 'benchmark_chart_efficiency.png'")

    # ------------------------------------------------
    # 2. A* Advantage (Explored vs Path)
    # ------------------------------------------------
    plt.figure(figsize=(10, 8))
    
    # Filter for Dijkstra and A* only for clarity in this chart
    target_solvers = [s for s in solvers if "Dijkstra" in s or "A*" in s]
    
    for i, solver in enumerate(target_solvers):
        x_vals = [] # Explored
        y_vals = [] # Path Length
        s_vals = [] # Sizes (for annotation)
        
        for size in sizes:
            entry = stats.get((solver, "solver", size))
            if entry:
                x_vals.append(entry["avg_explored"])
                y_vals.append(entry["avg_path"])
                s_vals.append(size)
        
        plt.plot(x_vals, y_vals, marker='o', linewidth=2, markersize=10, label=solver, color=colors[i])
        
        # Annotate points with sizes
        for j, txt in enumerate(s_vals):
            plt.annotate(txt, (x_vals[j], y_vals[j]), xytext=(5, 5), textcoords='offset points')

    plt.xlabel('Cells Explored (Work Cost)', fontsize=12, fontweight='bold')
    plt.ylabel('Path Length (Result Quality)', fontsize=12, fontweight='bold')
    plt.title('Solver Efficiency (Explored vs Path)', fontsize=14, fontweight='bold')
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig('benchmark_chart_astar_vs_dijkstra.png', dpi=300)
    plt.close()
    print("✅ Created 'benchmark_chart_astar_vs_dijkstra.png'")

    # ------------------------------------------------
    # 3. Scaling Analysis (Line Chart)
    # ------------------------------------------------
    plt.figure(figsize=(12, 6))
    
    for i, solver in enumerate(solvers):
        times = []
        valid_sizes = []
        for size in sizes:
            val = stats.get((solver, "solver", size), {}).get("avg_time", None)
            if val is not None:
                times.append(val)
                valid_sizes.append(size)
        
        if times:
            plt.plot(valid_sizes, times, marker='s', linewidth=2, label=solver, color=colors[i % len(colors)])

    plt.xlabel('Maze Size', fontsize=12)
    plt.ylabel('Time (s)', fontsize=12)
    plt.title('Solver Scalability (Time vs Size)', fontsize=14, fontweight='bold')
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig('benchmark_chart_scaling.png', dpi=300)
    plt.close()
    print("✅ Created 'benchmark_chart_scaling.png'")

    # ------------------------------------------------
    # 4. Time Complexity Analysis (Time vs Total Cells)
    # ------------------------------------------------
    plt.figure(figsize=(10, 8))
    
    for i, solver in enumerate(solvers):
        x_cells = []
        y_time = []
        
        # Extract data points for every single run (not just averages) to show spread
        for key in stats.keys():
            if key[0] == solver and key[1] == "solver":
                size_str = key[2]
                # Calculate total cells from "NxM" string
                if "x" in size_str:
                    n, m = map(int, re.findall(r'\d+', size_str))
                    total_cells = n * m
                    
                    # Use the raw metrics if available, otherwise use averages
                    # Since we aggregated stats, let's use the average time for this size
                    x_cells.append(total_cells)
                    y_time.append(stats[key]["avg_time"])
        
        # Sort by cells so the line connects properly
        if x_cells:
            combined = sorted(zip(x_cells, y_time))
            x_sorted, y_sorted = zip(*combined)
            plt.plot(x_sorted, y_sorted, marker='o', linewidth=2, label=solver, color=colors[i % len(colors)])
            
            # Simple Trend Line Check (Linear vs Quadratic)
            # Normalize to compare shapes
            # z = np.polyfit(x_sorted, y_sorted, 2)
            # p = np.poly1d(z)
            # plt.plot(x_sorted, p(x_sorted), linestyle=":", alpha=0.5, color=colors[i % len(colors)])

    plt.xlabel('Total Cells (N)', fontsize=12, fontweight='bold')
    plt.ylabel('Time (seconds)', fontsize=12, fontweight='bold')
    plt.title('Solver Runtime Scaling (Time vs Cells)', fontsize=14, fontweight='bold')
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig('benchmark_chart_solver_runtime.png', dpi=300)
    print("✅ Created 'benchmark_chart_solver_runtime.png'")

    # ------------------------------------------------
    # 5. Generator Analysis (Speed & Topology)
    # ------------------------------------------------
    plt.figure(figsize=(12, 6))
    
    # Filter for generators only
    generators_list = sorted(list(set(k[0] for k in stats.keys() if k[1] == "generator")))
    
    # 5a. Generator Speed (Time vs Total Cells)
    for i, gen in enumerate(generators_list):
        times = []
        cells = []
        for size in sizes:
            val = stats.get((gen, "generator", size), {}).get("avg_time", None)
            if val is not None:
                # Parse "NxM" to Total Cells N
                n, m = map(int, re.findall(r'\d+', size))
                times.append(val)
                cells.append(n * m)
        
        if times:
            # Sort by cells
            combined = sorted(zip(cells, times))
            x_sorted, y_sorted = zip(*combined)
            plt.plot(x_sorted, y_sorted, marker='^', linewidth=2, label=gen, color=colors[i % len(colors)])

    plt.xlabel('Total Cells (N)', fontsize=12, fontweight='bold')
    plt.ylabel('Generation Time (s)', fontsize=12, fontweight='bold')
    plt.title('Generator Runtime Scaling (Time vs Cells)', fontsize=14, fontweight='bold')
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig('benchmark_chart_generator_runtime.png', dpi=300)
    plt.close()
    print("✅ Created 'benchmark_chart_generator_runtime.png'")

    # 5b. Topology (Dead Ends vs Junctions) - 40x40 Only
    plt.figure(figsize=(10, 8))
    
    for i, gen in enumerate(generators_list):
        d_ends = []
        juncs = []
        for size in sizes:
             d = stats.get((gen, "generator", size), {}).get("avg_dead_ends", 0)
             j = stats.get((gen, "generator", size), {}).get("avg_junctions", 0)
             if d > 0: d_ends.append(d)
             if j > 0: juncs.append(j)
        
        if d_ends and juncs:
            # Plot the mean to show "Average Character"
            plt.scatter(np.mean(d_ends), np.mean(juncs), s=200, label=gen, color=colors[i % len(colors)], edgecolors='black')
            plt.text(np.mean(d_ends), np.mean(juncs), f"  {gen}", fontsize=9)

    plt.xlabel('Average Dead Ends (Tricky)', fontsize=12, fontweight='bold')
    plt.ylabel('Average Junctions (Branchy)', fontsize=12, fontweight='bold')
    plt.title('Maze Topology Character', fontsize=14, fontweight='bold')
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig('benchmark_chart_generators_topology.png', dpi=300)
    plt.close()
    print("✅ Created 'benchmark_chart_generators_topology.png'") 

def print_summary(stats):
    print("\n" + "="*60)
    print(f"{'ALGORITHM':<20} | {'SIZE':<8} | {'EXPLORED':<10} | {'TIME (s)':<10}")
    print("-" * 60)
    
    sizes = sort_sizes(list(set(k[2] for k in stats.keys())))
    generators = ["Recursive Backtracking", "Randomized Kruskal", "Randomized Prim", "Eller's Algorithm", "Wilson's Algorithm"]
    solvers = sorted(list(set(k[0] for k in stats.keys() if k[1] == "solver" and k[0] not in generators)))

    for solver in solvers:
        for size in sizes:
            d = stats.get((solver, "solver", size))
            if d:
                print(f"{solver:<20} | {size:<8} | {d['avg_explored']:<10.1f} | {d['avg_time']:<10.4f}")
        print("-" * 60)

def main():
    print("📊 Starting Maze Benchmark Analysis...")
    data = load_data()
    if not data:
        print("No data found. Aborting.")
        return

    print(f"📦 Analyzed {len(data)} records.")
    stats = get_stats(data)
    
    print_summary(stats)
    generate_charts(stats)
    print("\n✨ Analysis Complete. Open the PNG files to view charts.")

if __name__ == "__main__":
    main()
