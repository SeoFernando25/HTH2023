import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
    const id = params.slug;
    // Get the data from the database
    const data: number[] = [1, 2, 3];
    return { data };
}) satisfies PageServerLoad;