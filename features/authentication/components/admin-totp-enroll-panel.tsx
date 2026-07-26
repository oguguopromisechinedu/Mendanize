"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  beginAdminTotpEnrollAction,
  confirmAdminTotpEnrollAction,
  disableAdminTotpAction,
} from "../actions/actions";

export function AdminTotpEnrollPanel({
  totpEnabled,
}: {
  totpEnabled: boolean;
}) {
  const [pending, start] = useTransition();
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div>
        <h3 className="font-medium text-foreground">Authenticator app (TOTP)</h3>
        <p className="text-sm text-muted-foreground">
          {totpEnabled
            ? "2FA is enabled on your admin account."
            : "Protect your staff login with a one-time code."}
        </p>
      </div>

      {!totpEnabled && !qrUrl ? (
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await beginAdminTotpEnrollAction();
              if (!res.ok) {
                toast.error(res.message);
                return;
              }
              setQrUrl(res.qrUrl);
              setSecret(res.secret);
            })
          }
        >
          Set up 2FA
        </Button>
      ) : null}

      {qrUrl && !totpEnabled ? (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt="TOTP QR code"
            width={180}
            height={180}
            className="rounded-lg border border-border bg-white p-2"
          />
          {secret ? (
            <p className="break-all text-xs text-muted-foreground">
              Manual secret: <code>{secret}</code>
            </p>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="totp-confirm">Confirm with a code</Label>
            <Input
              id="totp-confirm"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              placeholder="6-digit code"
            />
          </div>
          <Button
            size="sm"
            disabled={pending || code.length < 6}
            onClick={() =>
              start(async () => {
                const res = await confirmAdminTotpEnrollAction(code);
                if (!res.ok) toast.error(res.message);
                else {
                  toast.success(res.message);
                  setQrUrl(null);
                  setSecret(null);
                  setCode("");
                  window.location.reload();
                }
              })
            }
          >
            Enable 2FA
          </Button>
        </div>
      ) : null}

      {totpEnabled ? (
        <div className="space-y-2">
          <Label htmlFor="totp-disable">Code to disable</Label>
          <Input
            id="totp-disable"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
          />
          <Button
            size="sm"
            variant="outline"
            disabled={pending || code.length < 6}
            onClick={() =>
              start(async () => {
                const res = await disableAdminTotpAction(code);
                if (!res.ok) toast.error(res.message);
                else {
                  toast.success(res.message);
                  window.location.reload();
                }
              })
            }
          >
            Disable 2FA
          </Button>
        </div>
      ) : null}
    </div>
  );
}
