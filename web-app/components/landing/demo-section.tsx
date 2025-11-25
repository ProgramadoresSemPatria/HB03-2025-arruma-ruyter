export function DemoSection() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-serif">
            Automated Security Reviews
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 ">
            Arruma catches vulnerabilities before they merge. It comments directly on your PRs with actionable fixes.
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/10   overflow-hidden">
          {/* Mock Browser Header */}
          <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3  ">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="mx-auto text-xs text-gray-400 font-mono">github.com/arruma/web-app/pull/123</div>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Code Side */}
            <div className="flex-1 p-6 font-mono text-sm bg-white  text-gray-800  overflow-x-auto">
              <div className="flex gap-4">
                <div className="text-gray-400 select-none text-right w-6">1</div>
                <div><span className="text-purple-600">const</span> handler = <span className="text-purple-600">async</span> (req, res) ={">"} {"{"}</div>
              </div>
              <div className="flex gap-4 bg-red-50  -mx-6 px-6 border-l-4 border-red-500 my-1">
                <div className="text-gray-400 select-none text-right w-6">2</div>
                <div>
                  &nbsp;&nbsp;<span className="text-purple-600">const</span> user = <span className="text-purple-600">await</span> db.query(
                </div>
              </div>
              <div className="flex gap-4 bg-red-50  -mx-6 px-6 border-l-4 border-red-500 my-1">
                <div className="text-gray-400 select-none text-right w-6">3</div>
                <div>
                  &nbsp;&nbsp;&nbsp;&nbsp;`<span className="text-green-600">SELECT * FROM users WHERE id = </span><span className="text-blue-600">{"${req.query.id}"}</span>`
                </div>
              </div>
              <div className="flex gap-4 bg-red-50  -mx-6 px-6 border-l-4 border-red-500 my-1">
                <div className="text-gray-400 select-none text-right w-6">4</div>
                <div>
                  &nbsp;&nbsp;);
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-gray-400 select-none text-right w-6">5</div>
                <div>&nbsp;&nbsp;res.json(user);</div>
              </div>
              <div className="flex gap-4">
                <div className="text-gray-400 select-none text-right w-6">6</div>
                <div>{"}"}</div>
              </div>
            </div>

            {/* Bot Comment Side */}
            <div className="w-full md:w-96 border-l border-gray-200 bg-gray-50 p-6  ">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  A
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 ">Arruma Bot</p>
                    <span className="text-xs text-gray-500">Just now</span>
                  </div>
                  <div className="mt-1 rounded-md bg-white p-3 text-sm shadow-sm ring-1 ring-gray-200 ">
                    <p className="font-medium text-red-600 dark:text-red-400 mb-2">
                      ⚠️ SQL Injection Vulnerability
                    </p>
                    <p className="text-gray-600  mb-3">
                      Directly interpolating user input allows attackers to execute arbitrary SQL.
                    </p>
                    <p className="text-xs font-mono bg-gray-100  p-2 rounded mb-2">
                      db.query('SELECT * FROM users WHERE id = $1', [req.query.id])
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-medium hover:bg-indigo-100 ">
                        Apply Fix
                      </button>
                      <button className="text-xs text-gray-500 hover:text-gray-700 ">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

