export const normalizeRepsPerSet = (exercise) => {
    const sets = exercise.sets;
    let reps = Array.isArray(exercise.repsPerSet) ? [...exercise.repsPerSet] : [];
    if (!reps.length && typeof exercise.reps === 'number') {
        reps = Array(sets).fill(exercise.reps);
    }
    if (!reps.length) {
        reps = Array(sets).fill(10);
    }
    if (reps.length < sets) {
        const last = reps[reps.length - 1] ?? 10;
        reps = reps.concat(Array(sets - reps.length).fill(last));
    }
    else if (reps.length > sets) {
        reps = reps.slice(0, sets);
    }
    return reps;
};
