import { Component, For, Match, Switch, createEffect, createResource, createSignal } from "solid-js";
import { fetchAllocations, fetchColNameDict, fetchStaffNames } from "./fetchFuns";

export const App2: Component = () => {

    const [colNameDict] = createResource(fetchColNameDict)
    const [staffNames] = createResource(colNameDict, fetchStaffNames)

    const [selectedStaff, setSelectedStaff] = createSignal("")
    const [selectedSemester, setSelectedSemester] = createSignal("")

    type QueryObj = {colNameDict: Record<string, string[]>, staff: string, semester: "Summer Semester" | "Semester One" | "Semester Two"}
    const queryDeps = () => ({colNameDict: colNameDict(), staff: selectedStaff(), semester: selectedSemester()})
    const fetchAlloc = async (queryDeps) => fetchAllocations(queryDeps)

    const [allocations] = createResource(queryDeps, fetchAlloc)

    createEffect(() => console.log(queryDeps()))

    return <div>

            <h1>Staff Allocations</h1>

            <div>
                <select onchange={(x) => setSelectedSemester(x.target.value)}>
                    <option selected disabled hidden>Select a semester</option>
                    <option>All </option>
                    <option>Summer Semester</option>
                    <option>Semester One</option>
                    <option>Semester Two</option>
                </select>
            </div>
            
            <div>
                    <select onchange={x => setSelectedStaff(x.target.value)}>
                    
                    <Switch fallback={<option selected disabled hidden>Select staff member</option>}>
                        <Match when={colNameDict.loading || staffNames.loading}>
                            <option>Loading...</option>
                        </Match>
                    </Switch>

                    <For each={staffNames()}>
                        {(staffName) => 
                        <option>{staffName as string}</option>
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
}