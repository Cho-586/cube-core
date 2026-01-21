/**
 * @example
 * const todo = defineCube(':id', {
 * param: c.number(),
 * get: { response: c.shape<Todo>() }
 * })
 * const todos = defineCube('todos', {
 *  get: { response: c.shape<Todo[]>() },
 *  post: {payload: c.shape<{todo: string}>(), response: c.shape<Todo>() }
 * children: [todo]
 * })
 * const api = createCubeClient({
 *  baseUrl: 'http://localhost:3000/api',
 *  requestOptions: {headers: {'Content-type': 'application/json'}},
 *  cube: [todos],
 *  defaultMode: 'fetch',
 * plugins: [fetchPlugin()]
 * })
 * --- In code (any framework) ---
 * <script>
 * const todos = await api.todos.get()
 * </script>
 * // todos can be mapped here
 * <button onclick={await api.todos.post({data: {todo: 'New todo'}})} >Add todo</button>
 */
