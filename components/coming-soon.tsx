import { HugeiconsIcon } from "@hugeicons/react";
import { ConstructionIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-medium">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Fitur ini sedang dalam pengembangan.
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <HugeiconsIcon
            icon={ConstructionIcon}
            size={32}
            className="text-muted-foreground"
          />
          <div>
            <p className="font-medium">Segera Hadir</p>
            <p className="text-sm text-muted-foreground">
              Halaman {title.toLowerCase()} akan tersedia pada fase berikutnya.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}