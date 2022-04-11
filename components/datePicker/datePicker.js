import { DateTime } from "luxon";
import cn from "classnames";
import { typography } from "../../styles/utilities";
import styles from "./datePicker.module.css";

export default function DatePicker({ label, name, value, ...rest }) {
  const date = DateTime.fromISO(value);

  return (
    <>
      <label for={name} className={cn(typography.eta, styles.label)}>
        {" "}
        {label}
      </label>

      <input
        name={name}
        type={"datetime-local"}
        {...rest}
        value={date.toISO({ includeOffset: false })}
      />
    </>
  );
}
