import { sehirBul, sehirler } from "../../gezi-verileri";
import { MekanRehberiClient } from "./MekanRehberiClient";

export default async function MekanRehberi({
  params,
  searchParams,
}: {
  params: Promise<{ sehirId: string }>;
  searchParams?: Promise<{ mekan?: string }>;
}) {
  const { sehirId } = await params;
  const query = searchParams ? await searchParams : {};
  const sehir = sehirBul(sehirId) ?? sehirler[0];

  return (
    <MekanRehberiClient
      baslangicMekanId={query.mekan}
      sehir={sehir}
    />
  );
}
