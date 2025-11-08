# Variables: 5 states
variables = ["MH", "GJ", "RJ", "MP", "UP"]

# Domains: possible colors
colors = ["red", "green", "blue"]
domains = {var: colors[:] for var in variables}

# Neighbors (simplified)
neighbors = {
    "MH": ["GJ", "RJ", "MP"],
    "GJ": ["MH", "RJ"],
    "RJ": ["GJ", "MH", "MP", "UP"],
    "MP": ["MH", "RJ", "UP"],
    "UP": ["RJ", "MP"]
}

# Backtracking search
def is_consistent(state, color, assignment):
    for neighbor in neighbors[state]:
        if neighbor in assignment and assignment[neighbor] == color:
            return False
    return True

def backtrack(assignment):
    if len(assignment) == len(variables):
        return assignment  # all states assigned
    unassigned = [v for v in variables if v not in assignment]
    var = unassigned[0]
    for color in domains[var]:
        if is_consistent(var, color, assignment):
            assignment[var] = color
            result = backtrack(assignment)
            if result:
                return result
            assignment.pop(var)
    return None  # failure

# Solve CSP
solution = backtrack({})
if solution:
    print("5-State India Map Coloring Solution:")
    for state in sorted(solution):
        print(f"{state}: {solution[state]}")
else:
    print("No solution found.")
