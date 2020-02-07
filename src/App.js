import React from "react";
import "./styles.css";

const FINES = [
  {
    id: 1,
    reason: "Eccesso di velocità",
    plate: "ES 222 KS"
  },
  {
    id: 2,
    reason: "Sosta vietata",
    plate: "ES 222 KS"
  },
  {
    id: 3,
    reason: "Attraversamento ZTL",
    plate: "HF 987 RT"
  }
];

const CHECKBOX_EMPTY = "[ ]";
const CHECKBOX_INDETERMINATE = "[-]";
const CHECKBOX_FULL = "[x]";

async function fetchFines(plate) {
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (!plate) {
    return FINES;
  }

  return FINES.filter(fine => fine.plate === plate);
}

export default function App() {
  const [plate, setPlate] = React.useState("");

  const [filterPlate, setFilterPlate] = React.useState("");

  const [fines, setFines] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let ignore = false;

    fetchFines(filterPlate)
      .then(fines => {
        if (!ignore) {
          setFines(fines);
          setError(null);
        }
      })
      .catch(error => {
        if (!ignore) {
          setError(error);
        }
      });

    return () => {
      ignore = true;
    };
  }, [filterPlate]);

  const stupidCounter = useStupidCounter();

  const [selection, setSelection] = usePersistentState("selection", {});

  const noSelected = fines && fines.every(fine => !selection[fine.id]);

  const allSelected = fines && fines.every(fine => selection[fine.id]);

  function handleHeaderCheckboxClick(event) {
    // Se l'utente ha già selezionato
    // tutti gli elementi della tabella
    if (allSelected) {
      // …allora la nuova selezione…
      setSelection(
        // è “vuota”
        {}
      );
    } else {
      // …altrimenti devo produrre una
      // nuova selezione dove tutti
      // gli elementi sono a `true`
      //
      // Creo un nuovo oggetto "vuoto"
      // per la prossima selezione
      const nextSelection = {};
      // per ciascuna multa…
      for (let fine of fines) {
        // imposto la proprietà con il
        // nome pari all'ID della multa
        // a `true`, **mutando** l'oggetto
        // che abbiamo creato.
        nextSelection[fine.id] = true;
      }
      // Dico a React che la nuova
      // selezione è il nuovo oggetto
      // creato
      setSelection(nextSelection);
    }
  }

  if (fines == null) {
    return "Loading…";
  }

  return (
    <table>
      <thead>
        <tr>
          <th onClick={handleHeaderCheckboxClick}>
            {allSelected
              ? CHECKBOX_FULL
              : noSelected
              ? CHECKBOX_EMPTY
              : CHECKBOX_INDETERMINATE}
          </th>
          <th>ID</th>
          <th>Targa</th>
          <th>Ragione</th>
        </tr>
        <tr>
          <th colSpan={4}>
            <input
              placeholder="Cerca per targa"
              value={plate}
              onChange={event => setPlate(event.currentTarget.value)}
            />
            <button
              onClick={event => {
                setFilterPlate(plate);
              }}
            >
              Cerca ({filterPlate})
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {fines.map(fine => (
          <FineRow
            key={fine.id}
            fine={fine}
            selected={Boolean(selection[fine.id])}
            onToggle={event => {
              setSelection(selection => ({
                ...selection,
                [fine.id]: !selection[fine.id]
              }));
            }}
          />
        ))}
      </tbody>
    </table>
  );
}

function updateAt(obj, key, value) {
  return { ...obj, [key]: value };
}

function useStupidCounter() {
  const [counter, setCounter] = React.useState(0);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setCounter(counter => counter + 1);
    }, 2000);

    return () => {
      clearInterval(intervalId);
    };
  });

  return counter;
}

function usePersistentState(storageKey, initialValue) {
  const [value, setValue] = React.useState(() => {
    try {
      return (
        JSON.parse(window.localStorage.getItem(storageKey)) || initialValue
      );
    } catch (e) {
      return initialValue;
    }
  });

  React.useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  }, [storageKey, value]);

  React.useEffect(() => {
    function listener(event) {
      if (event.key === storageKey) {
        setValue(JSON.parse(event.newValue));
      }
    }

    window.addEventListener("storage", listener);

    return () => {
      window.removeEventListener("storage", listener);
    };
  }, [storageKey]);

  return [value, setValue];
}

function Fieldset(props) {
  const [open, setOpen] = React.useState(true);

  function handleToggle() {
    setOpen(open => !open);
  }

  return (
    <div
      onClick={handleToggle}
      style={{
        border: "2px solid red"
      }}
    >
      <div
        style={{
          textTransform: "uppercase",
          fontWeight: "bold",
          letterSpacing: ".3ex",
          fontSize: "0.6em"
        }}
      >
        {props.title}
      </div>
      {open ? props.children : null}
    </div>
  );
}

function FineRow({ selected, onToggle, fine }) {
  return (
    <tr>
      <td onClick={onToggle}>{selected ? CHECKBOX_FULL : CHECKBOX_EMPTY}</td>
      <td>{fine.id}</td>
      <td>{fine.plate}</td>
      <td>
        <Fieldset title="Che hai fatto?">{fine.reason}</Fieldset>
      </td>
    </tr>
  );
}
