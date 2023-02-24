import { Component, For, createEffect, createResource, createSignal, onMount } from 'solid-js';
import { fetchAllocations, fetchColNameDict, fetchStaffNames } from './fetchFuns';

const App: Component = () => {
  const state = {} as Record<string, any>

  onMount(async () => {
    Object.assign(state, {colNameDict: await fetchColNameDict()})
    Object.assign(state, {staffNames: await fetchStaffNames(state)})
    setStaff(state.staffNames)
})

  const [staff, setStaff] = createSignal([])
  const [selectedStaff, setSelectedStaff] = createSignal("All")
  const [selectedPeriod, setSelectedPeriod] = createSignal("All")
  const [fetchClick, setFetchClick] = createSignal(true)
  
  const fetchAlloc = async (staff: string) => fetchAllocations(state, "All", staff)
  const [allocations] = createResource(selectedStaff, fetchAlloc)

  createEffect(() => console.log(selectedStaff()))
  // createEffect(() => console.log(selectedPeriod()))



  
  return (
    <div>
        <h1>
          Time Allocations
        </h1>

        <div>
          Period:
          <select onchange={x => setSelectedPeriod(x.target.value)}>
          <option>All</option>
          <option>Summer Semester</option>
          <option> Semester One</option>
          <option>Semester Two</option>
        </select>
        </div>

        <div>
          Lecturer:
          <select onchange={x => setSelectedStaff(x.target.value)}>
            <option>All</option>
            <For each={staff()}>
              {(staff) => 
              <option>{staff}</option>
              }
            </For>
          </select>
        </div>

        <div>
          <table>
            <thead>
              <tr> <th>Name</th> <th>Amount</th> </tr>
            </thead>
            <tbody>
              <For each={Object.entries(allocations() ?? {})}>
                {(allocation) => 
                <tr> <td>{allocation[0]}</td> <td>{allocation[1]}</td></tr>
                }
              </For>
            </tbody>
          </table>
        </div>

    </div>
  );
};

export default App;
