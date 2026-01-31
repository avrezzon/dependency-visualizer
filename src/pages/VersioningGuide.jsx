import { BookOpen, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const Section = ({ title, children, icon: Icon }) => (
  <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
      {Icon && <Icon className="w-6 h-6 text-indigo-600" />}
      {title}
    </h2>
    <div className="text-slate-600 space-y-4">
      {children}
    </div>
  </section>
);

const CodeBlock = ({ children, label }) => (
  <div className="mt-4">
    {label && <div className="text-xs font-bold uppercase text-slate-500 mb-1">{label}</div>}
    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
      {children}
    </pre>
  </div>
);

export default function VersioningGuide() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BookOpen className="text-indigo-600 w-8 h-8" />
            Versioning Guide
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            A practical guide to Semantic Versioning and Build Types for Java Spring Boot developers.
          </p>
        </header>

        {/* Semantic Versioning */}
        <Section title="Semantic Versioning (SemVer)" icon={Info}>
          <p>
            Semantic Versioning uses the format <code className="bg-slate-100 px-1 py-0.5 rounded font-bold">MAJOR.MINOR.PATCH</code>.
            Understanding when to increment each number is crucial for maintaining a healthy dependency graph.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="font-bold text-indigo-900 text-lg mb-2">MAJOR</div>
              <p className="text-sm text-indigo-800 mb-2">Incompatible API changes.</p>
              <div className="text-xs bg-white p-2 rounded border border-indigo-200 text-indigo-700">
                v1.0.0 &rarr; v2.0.0
              </div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="font-bold text-emerald-900 text-lg mb-2">MINOR</div>
              <p className="text-sm text-emerald-800 mb-2">Backwards-compatible functionality.</p>
              <div className="text-xs bg-white p-2 rounded border border-emerald-200 text-emerald-700">
                v1.1.0 &rarr; v1.2.0
              </div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <div className="font-bold text-amber-900 text-lg mb-2">PATCH</div>
              <p className="text-sm text-amber-800 mb-2">Backwards-compatible bug fixes.</p>
              <div className="text-xs bg-white p-2 rounded border border-amber-200 text-amber-700">
                v1.0.1 &rarr; v1.0.2
              </div>
            </div>
          </div>
        </Section>

        {/* Examples */}
        <Section title="Real-World Spring Boot Examples" icon={CheckCircle}>

          <div className="space-y-8">
            {/* Major Example */}
            <div>
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">MAJOR</span>
                Breaking Change
              </h3>
              <p className="mt-2 text-sm">
                You change the method signature of a public service, or remove a deprecated field.
                Consumers of your library will fail to compile until they update their code.
              </p>
              <CodeBlock label="Before (v1.0.0)">
{`public interface UserService {
    // Returns User object
    User getUser(String id);
}`}
              </CodeBlock>
              <CodeBlock label="After (v2.0.0) - Return type changed to Optional">
{`public interface UserService {
    // Returns Optional<User> - BREAKING CHANGE
    Optional<User> getUser(String id);
}`}
              </CodeBlock>
            </div>

            <div className="border-t border-slate-100"></div>

            {/* Minor Example */}
            <div>
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">MINOR</span>
                New Feature
              </h3>
              <p className="mt-2 text-sm">
                You add a new method to an interface (with a default implementation) or a new endpoint to a controller.
                Old code still works exactly the same.
              </p>
              <CodeBlock label="Before (v1.1.0)">
{`@RestController
@RequestMapping("/api/users")
public class UserController {
    @GetMapping("/{id}")
    public User getUser(@PathVariable String id) { ... }
}`}
              </CodeBlock>
              <CodeBlock label="After (v1.2.0) - Added search endpoint">
{`@RestController
@RequestMapping("/api/users")
public class UserController {
    @GetMapping("/{id}")
    public User getUser(@PathVariable String id) { ... }

    // New endpoint - Non-breaking
    @GetMapping("/search")
    public List<User> searchUsers(@RequestParam String name) { ... }
}`}
              </CodeBlock>
            </div>

            <div className="border-t border-slate-100"></div>

            {/* Patch Example */}
            <div>
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">PATCH</span>
                Bug Fix
              </h3>
              <p className="mt-2 text-sm">
                You fix an internal NullPointerException or logic error without changing the public API.
              </p>
              <CodeBlock label="Before (v1.0.1) - Potential NPE">
{`public BigDecimal calculateTotal(Order order) {
    return order.getItems().stream()
        .map(Item::getPrice)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
}`}
              </CodeBlock>
              <CodeBlock label="After (v1.0.2) - Null check added">
{`public BigDecimal calculateTotal(Order order) {
    if (order == null || order.getItems() == null) {
        return BigDecimal.ZERO;
    }
    return order.getItems().stream()
        // ... rest of logic
}`}
              </CodeBlock>
            </div>
          </div>
        </Section>

        {/* Build Types */}
        <Section title="Build Types: SNAPSHOT vs RC vs Release" icon={AlertTriangle}>
          <div className="space-y-6">

            <div className="flex gap-4 items-start">
              <div className="w-24 shrink-0 font-mono text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded text-center">
                -SNAPSHOT
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Development Builds</h4>
                <p className="text-sm mt-1">
                  Represents the &quot;latest work in progress&quot; for the <i>next</i> version.
                  Snapshots are mutable; downloading <code>1.1.0-SNAPSHOT</code> today might give different code than yesterday.
                  <b>Never use SNAPSHOT dependencies in production.</b>
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-24 shrink-0 font-mono text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded text-center">
                -RC
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Release Candidate</h4>
                <p className="text-sm mt-1">
                  A potential final release (e.g., <code>2.0.0-RC1</code>). It is feature-complete and waiting for final testing.
                  If no bugs are found, this exact artifact can become the final release (or be rebuilt as such).
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-24 shrink-0 font-mono text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-center">
                Release
              </div>
              <div>
                <h4 className="font-bold text-slate-800">GA / Final Release</h4>
                <p className="text-sm mt-1">
                  The stable, immutable version (e.g., <code>1.0.0</code>).
                  Once published to a repository (like Maven Central or Artifactory), it <b>must never change</b>.
                  If a bug is found, you must release a new version (e.g., <code>1.0.1</code>).
                </p>
              </div>
            </div>

          </div>
        </Section>

      </div>
    </div>
  );
}