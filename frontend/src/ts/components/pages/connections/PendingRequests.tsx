import { Connection } from "@monkeytype/schemas/connections";
import { createColumnHelper } from "@tanstack/solid-table";
import { format as dateFormat } from "date-fns/format";
import { createMemo, Show } from "solid-js";

import {
  acceptConnection,
  blockConnection,
  rejectConnection,
  usePendingConnectionsQuery,
} from "../../../collections/connections";
import { t } from "../../../i18n/store";
import { formatAge } from "../../../utils/date-and-time";
import AsyncContent from "../../common/AsyncContent";
import { Button } from "../../common/Button";
import { H2 } from "../../common/Headers";
import { User } from "../../common/User";
import {
  DataTable,
  DataTableColumnDef,
  DataTableFeatures,
} from "../../ui/table/DataTable";

export function PendingRequests() {
  const columns = createMemo(() => getColumns());
  const pendingQuery = usePendingConnectionsQuery();
  return (
    <AsyncContent collections={{ pendingQuery }}>
      {({ pendingQueryData }) => (
        <Show when={pendingQueryData().length > 0}>
          <div>
            <H2
              text="Incoming Requests"
              fa={{ icon: "fa-user-plus", fixedWidth: true }}
            />
            <DataTable
              id="pendingConnections"
              columns={columns()}
              data={pendingQueryData()}
            />
          </div>
        </Show>
      )}
    </AsyncContent>
  );
}

function getColumns(): DataTableColumnDef<Connection>[] {
  const defineColumn = createColumnHelper<DataTableFeatures, Connection>()
    .accessor;
  const cols = [
    defineColumn("initiatorName", {
      enableSorting: true,
      header: t("user"),
      cell: (info) => (
        <User
          user={{ name: info.getValue(), uid: info.row.original.initiatorUid }}
          showAvatar={false}
          linkToProfile
          class="w-min [&_[data-ui-element=button]]:[--themable-button-text:var(--text-color)]"
        />
      ),
    }),
    defineColumn("lastModified", {
      enableSorting: true,
      header: t("date"),
      cell: (info) => t("{age} ago", { age: formatAge(info.getValue()) }),
      meta: {
        cellMeta: ({ value }) => ({
          "aria-label": t("since {date}", {
            date: dateFormat(value, "dd MMM yyyy HH:mm"),
          }),
          "data-balloon-pos": "up",
        }),
        breakpoint: "md",
      },
    }),
    defineColumn("_id", {
      header: "",

      cell: (info) => (
        <div class="flex justify-end gap-2">
          <Button
            onClick={() => void acceptConnection({ id: info.getValue() })}
            balloon={{ text: t("accept") }}
            fa={{ icon: "fa-check", fixedWidth: true }}
          />
          <Button
            onClick={() => void rejectConnection({ id: info.getValue() })}
            balloon={{ text: t("reject") }}
            fa={{ icon: "fa-times", fixedWidth: true }}
          />
          <Button
            onClick={() => void blockConnection({ id: info.getValue() })}
            balloon={{ text: t("block user") }}
            fa={{ icon: "fa-ban", fixedWidth: true }}
          />
        </div>
      ),
    }),
  ];

  return cols;
}
