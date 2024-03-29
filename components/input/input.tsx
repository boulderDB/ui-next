import cx from "classix";
import styles from "./input.module.css";
import utilities from "../../styles/utilities/utilities";
import { FormFieldProps } from "../form/form";
import { Icon } from "../icon/icon";

export type InputProps = FormFieldProps<string | number> &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">;

export function Input({
  type,
  onChange,
  className,
  hasError,
  ...rest
}: InputProps) {
  return (
    <div
      className={cx(styles.root, hasError ? styles.hasError : null, className)}
    >
      <input
        {...rest}
        type={type}
        className={cx(utilities.typograpy.gamma700, styles.input)}
        onChange={(event) => {
          if (typeof onChange === "function") {
            onChange(
              type === "number"
                ? event.target.valueAsNumber
                : event.target.value
            );
          }
        }}
      />

      {hasError ? (
        <Icon name="error" className={styles.errorIndicator} />
      ) : null}
    </div>
  );
}
