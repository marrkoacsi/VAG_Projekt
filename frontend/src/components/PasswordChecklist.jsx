function PasswordChecklist({ checks }) {
  const items = [
    { key: "length", label: "Legalább 8 karakter" },
    { key: "upper", label: "Tartalmaz nagybetűt" },
    { key: "digit", label: "Tartalmaz számot" },
    { key: "special", label: "Tartalmaz speciális karaktert" },
  ];
  return (
    <ul className="password-list">
      {items.map((item) => (
        <li
          key={item.key}
          className={
            checks[item.key] ? "password-list__item ok" : "password-list__item"
          }
        >
          <span className="password-list__bullet">
            {checks[item.key] ? "✔" : "•"}
          </span>
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export default PasswordChecklist;