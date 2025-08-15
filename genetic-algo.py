import random

# Sample Data
videos = [
    {"id": 1, "channel": "TechGuru", "tags": ["AI", "Python", "Tech"]},
    {"id": 2, "channel": "FoodieFun", "tags": ["Cooking", "Food", "Recipe"]},
    {"id": 3, "channel": "TravelWorld", "tags": ["Travel", "Nature", "Vlog"]},
    {"id": 4, "channel": "TechGuru", "tags": ["Programming", "Python", "AI"]},
    {"id": 5, "channel": "DailyNews", "tags": ["News", "Politics"]},
    {"id": 6, "channel": "FoodieFun", "tags": ["Food", "StreetFood"]},
    {"id": 7, "channel": "TravelWorld", "tags": ["Adventure", "Travel"]},
    {"id": 8, "channel": "TechGuru", "tags": ["AI", "MachineLearning"]},
]

user_profile = {
    "watch_history": [1, 4],
    "subscriptions": ["TechGuru", "FoodieFun"],
    "liked_videos": [1, 6]
}

def fitness(video_id, user_profile, videos):
    video = next(v for v in videos if v["id"] == video_id)
    if video_id in user_profile["watch_history"]:
        return -100
    
    score = 1  # Base score
    if video["channel"] in user_profile["subscriptions"]:
        score += 10
    
    # Get tags from liked videos and history
    liked_tags = set()
    history_tags = set()
    for vid_id in user_profile["liked_videos"]:
        liked_tags.update(next(v for v in videos if v["id"] == vid_id)["tags"])
    for vid_id in user_profile["watch_history"]:
        history_tags.update(next(v for v in videos if v["id"] == vid_id)["tags"])
    
    score += len(set(video["tags"]) & liked_tags) * 5
    score += len(set(video["tags"]) & history_tags) * 3
    return score

def selection(population, user_profile, videos):
    scored = [(vid, fitness(vid, user_profile, videos)) for vid in population]
    scored.sort(key=lambda x: x[1], reverse=True)
    return [vid for vid, _ in scored[:4]]  # Keep top 4

def crossover(parents, videos, target_size):
    offspring = []
    while len(offspring) < target_size - len(parents):
        p1, p2 = random.sample(parents, 2)
        parent_tags = set()
        for p in [p1, p2]:
            parent_tags.update(next(v for v in videos if v["id"] == p)["tags"])
        
        candidates = [v["id"] for v in videos 
                     if v["id"] not in parents + offspring and 
                     set(v["tags"]) & parent_tags]
        
        if candidates:
            offspring.append(random.choice(candidates))
        else:
            unused = [v["id"] for v in videos if v["id"] not in parents + offspring]
            if unused:
                offspring.append(random.choice(unused))
    return offspring

def mutation(offspring, videos, existing, mutation_rate=0.3):
    for i in range(len(offspring)):
        if random.random() < mutation_rate:
            available = [v["id"] for v in videos if v["id"] not in existing]
            if available:
                offspring[i] = random.choice(available)
    return offspring

def genetic_algorithm(videos, user_profile, generations=10):
    unwatched = [v["id"] for v in videos if v["id"] not in user_profile["watch_history"]]
    population = random.sample(unwatched, min(6, len(unwatched)))
    
    for _ in range(generations):
        parents = selection(population, user_profile, videos)
        offspring = crossover(parents, videos, 6)
        offspring = mutation(offspring, videos, parents + offspring)
        population = list(set(parents + offspring))
        
        while len(population) < 6:
            available = [v["id"] for v in videos if v["id"] not in population]
            if available:
                population.append(random.choice(available))
            else:
                break
    
    # Final scoring and filtering
    final_scores = [(vid, fitness(vid, user_profile, videos)) for vid in population]
    quality_recs = [(vid, score) for vid, score in final_scores if score > 1]
    quality_recs.sort(key=lambda x: x[1], reverse=True)
    
    return quality_recs[:5]

# Run the algorithm
recommendations = genetic_algorithm(videos, user_profile)

print("=== TOP 5 RECOMMENDED VIDEOS ===")
for i, (vid, score) in enumerate(recommendations, 1):
    video = next(v for v in videos if v["id"] == vid)
    print(f"{i}. Video {vid} | {video['channel']} | {video['tags']} | Score: {score}")