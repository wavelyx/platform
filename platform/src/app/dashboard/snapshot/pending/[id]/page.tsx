
import CheckSnapshotStatus from "src/sections/snapshot/pending-page"

export const metadata = {
    title: ' Your snapshot is being processed, please wait...',
}


interface Params {
    id: string;
  }

export default function SnapshotCompletedPage({params} : {params: Params}) {
    const { id } = params;

    return (
        <CheckSnapshotStatus id={id} />
    )
}
