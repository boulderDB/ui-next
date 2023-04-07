import { useRouter } from "next/router";
import { BoulderView } from "../../../components/boulderView/boulderView";
import Loader from "../../../components/loader/loader";
import { fetcher } from "../../../lib/http";
import { Boulder, Event, User } from "../../../lib/types";
import utilities from "../../../styles/utilities/utilities";
import { useAppContext } from "../../_app";
import useSWR from "swr";
import { parseDate } from "../../../utilties/parseDate";
import { Notice } from "../../../components/notice/notice";

export default function Page() {
  const { currentLocation, hasRole } = useAppContext();
  const { query } = useRouter();

  const { data } = useSWR<Boulder[]>(
    `/api/${currentLocation?.url}/boulders`,
    fetcher
  );

  const { data: user } = useSWR<User>(
    hasRole("ROLE_ADMIN") && query.forUser
      ? `/api/${currentLocation?.url}/users/${query.forUser}`
      : null,
    fetcher
  );

  const { data: event } = useSWR<Event>(
    `/api/${currentLocation?.url}/events/${query.forEvent}`,
    fetcher
  );

  if (!data) {
    return <Loader />;
  }

  if (!event) {
    return <h1 className={utilities.typograpy.alpha700}>Event not found</h1>;
  }

  if (event.state === "ended") {
    return (
      <Notice type="error" display="inline">
        <h1 className={utilities.typograpy.alpha700}>
          This event has ended on {parseDate(event.endDate, true).string}
        </h1>
      </Notice>
    );
  }

  if (event.state === "upcoming") {
    return (
      <Notice type="error" display="inline">
        <h1 className={utilities.typograpy.alpha700}>
          This event starts {parseDate(event.startDate, true).string}
        </h1>
      </Notice>
    );
  }

  return (
    <>
      <h1 className={utilities.typograpy.alpha700}>Boulder ({data.length})</h1>
      <BoulderView data={data} forUser={user} forEvent={event} />
    </>
  );
}