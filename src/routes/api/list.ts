import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { setResponseStatus } from '@tanstack/react-start/server'

const FOOD_TRUCKS_URL = 'https://data.sfgov.org/resource/rqzj-sfat.json'

/**
 * @openapi
 * /api/list:
 *   get:
 *     summary: List all food trucks
 *     responses:
 *       200:
 *         description: A list of food trucks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

export const APIRoute = createAPIFileRoute('/api/list')({
  GET: async () => {
    try {
      const data = await fetch(FOOD_TRUCKS_URL).then(res => res.json())
      return json(data);
    } catch (error) {
      setResponseStatus(500);
      return new Response('Unable to fetch food trucks');
    }
  },
})
