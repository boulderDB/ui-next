import { useState } from "react";
import styles from "./upload.module.css";
import { Icon } from "../icon/icon";
import { FormFieldProps } from "../form/form";
import cx from "classix";

export type UploadProps = FormFieldProps<string> & {
  value: string;
  onUpload: (formData: FormData) => Promise<string>;
};

export function Upload({ name, value, onChange, onUpload }: UploadProps) {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div className={cx(styles.root, loading ? styles.isLoading : null)}>
      <div
        className={styles.preview}
        style={{ backgroundImage: `url(${value})` }}
      />

      <label className={styles.label}>
        <input
          type="file"
          className={styles.input}
          name={name}
          onChange={async (event) => {
            try {
              setLoading(true);

              if (event.target.files) {
                const formData = new FormData();
                formData.append("file", event.target.files[0]);

                const file = await onUpload(formData);

                if (typeof onChange === "function") {
                  onChange(file);
                }
              }
            } catch (error) {
            } finally {
              setLoading(false);
            }
          }}
        />

        <div className={styles.icon}>
          <Icon name="plus" />
        </div>
      </label>
    </div>
  );
}
