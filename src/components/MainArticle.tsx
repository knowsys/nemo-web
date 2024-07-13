export function MainArticle() {
  return (
    <article>
      <h1>The Nemo Rule Engine</h1>
      Nemo is a datalog-based rule engine for fast and scalable analytic data
      processing in memory. Source code, documentation and issues can be found
      at{" "}
      <a href="https://github.com/knowsys/nemo/">
        https://github.com/knowsys/nemo/
      </a>
      .
      <br />
      <h1>Nemo Web</h1>
      <p>
        Nemo Web provides an interactive user interface to Nemo directly in your
        Web Browser. It not only allows for easy experimentation with Nemo but
        also provides a integrated development environment.
      </p>
      <h2>Features of Nemo Web</h2>
      <ul>
        <li>
          Code editor for writing Nemo programs
          <ul>
            <li>Syntax highlighting</li>
            <li>Renaming variables</li>
            <li>Finding references</li>
            <li>Auto-complete</li>
            <li>Auto-save (local storage), opening and saving local files</li>
          </ul>
        </li>
        <li>
          Running Nemo progams
          <ul>
            <li>Add local files or load remote files as inputs</li>
            <li>In-browser reasoning</li>
            <li>Showing results on demand</li>
            <li>Saving results to disk</li>
          </ul>
        </li>
      </ul>
      <h2>Technical backgrounds of Nemo Web</h2>
      <p>
        The Nemo Rule Engine itself is written in Rust. To run Nemo in Web
        Browsers, we use a combination of Web Assmebly, Web Workers and the Web
        File System API. This allows for fast reasoning with up to 4 GiB of
        memory, without installing any addional software on your computer. Code
        editing and reasoning run locally, neither the program code nor opened
        files for reasoning are sent to an external server.
      </p>
    </article>
  );
}
