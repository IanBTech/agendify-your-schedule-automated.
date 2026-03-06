import { Copy, Share2, Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";

export default function MeuLinkPage() {
  const { profile } = useAuth();
  const qrRef = useRef<HTMLDivElement>(null);

  const slug = profile?.slug;
  const bookingUrl = slug ? `${window.location.origin}/book/${slug}` : null;

  const copiar = () => {
    if (bookingUrl) {
      navigator.clipboard.writeText(bookingUrl);
      toast.success("Link copiado!");
    }
  };

  const compartilharWhatsApp = () => {
    if (bookingUrl) {
      window.open(`https://wa.me/?text=${encodeURIComponent(`Agende comigo: ${bookingUrl}`)}`, "_blank");
    }
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "agendify-qrcode.png";
      a.click();
    }
  };

  if (!slug) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Meu Link</h1>
        <Card className="shadow-card">
          <CardContent className="p-6 text-center">
            <QrCode className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Configure sua URL de agendamento primeiro.</p>
            <p className="text-sm text-muted-foreground">Vá em <strong>Configurações</strong> e defina sua URL personalizada.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="font-display text-2xl font-bold">Meu Link</h1>
      <p className="text-sm text-muted-foreground">Compartilhe sua página de agendamento com clientes.</p>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base font-display">Seu link de agendamento</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={bookingUrl} readOnly className="font-mono text-sm" />
            <Button variant="outline" size="icon" onClick={copiar}><Copy className="h-4 w-4" /></Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={compartilharWhatsApp}>
              <Share2 className="h-4 w-4 mr-2" /> WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={downloadQR}>
              <Download className="h-4 w-4 mr-2" /> Baixar QR Code
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base font-display">QR Code</CardTitle></CardHeader>
        <CardContent className="flex justify-center" ref={qrRef}>
          <QRCodeCanvas
            value={bookingUrl}
            size={200}
            level="H"
            marginSize={2}
            imageSettings={{
              src: "",
              height: 0,
              width: 0,
              excavate: false,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
