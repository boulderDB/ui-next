import Layout from "../components/layout/layout";
import Meta from "../components/meta/meta";
import { layoutStyles, typography } from "../styles/utilities";
import cn from "classnames";

export default function Index() {
  return (
    <Layout>
      <Meta title={"Account"} />

      <div className={layoutStyles.grid}>
        <h1 className={cn(layoutStyles.sideTitle, typography.alpha700)}>
          Dashboard
        </h1>

        <div className={layoutStyles.sideContent}>123</div>
      </div>
    </Layout>
  );
}
