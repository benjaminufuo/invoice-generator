"use client";

import React, { useState, useEffect } from "react";
import { Invoice } from "@/types";
import { formatCurrency } from "@/lib/calculations";
import { Button } from "@/components/ui/Button";
import {
  X,
  Share2,
  Copy,
  Check,
  Mail,
  MessageCircle,
  Globe,
  Lock,
  ExternalLink,
} from "lucide-react";

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onInvoiceUpdated?: (updated: Invoice) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onInvoiceUpdated,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const isEnabled = Boolean(invoice.isPublicShareEnabled);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
      const origin = window.location.origin;
      if (invoice.shareToken) {
        setShareUrl(`${origin}/share/${invoice.shareToken}`);
      } else {
        setShareUrl("");
      }
    }
  }, [invoice.shareToken, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isToggling) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isToggling, onClose]);

  if (!isOpen) return null;

  // Toggle Public Share Link
  const handleToggleShare = async () => {
    setIsToggling(true);
    try {
      const method = isEnabled ? "DELETE" : "POST";
      const res = await fetch(`/api/invoices/${invoice._id}/share`, {
        method,
      });

      if (res.ok) {
        const data = await res.json();
        const updatedInvoice: Invoice = {
          ...invoice,
          isPublicShareEnabled: data.data.isPublicShareEnabled,
          shareToken: data.data.shareToken || invoice.shareToken,
        };
        if (onInvoiceUpdated) {
          onInvoiceUpdated(updatedInvoice);
        }
        if (data.data.shareUrl) {
          setShareUrl(data.data.shareUrl);
        }
      }
    } catch (err) {
      console.error("Failed to toggle share state:", err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const shareText = `Invoice ${invoice.invoiceNumber} from ${invoice.sender.name} for ${formatCurrency(
    invoice.total,
    invoice.currency
  )}`;

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${invoice.invoiceNumber}`,
          text: shareText,
          url: shareUrl || window.location.href,
        });
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") {
          console.error("Error during native share:", err);
        }
      }
    }
  };

  const emailSubject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from ${invoice.sender.name}`);
  const emailBody = encodeURIComponent(
    `Hello ${invoice.customer.name},\n\nPlease find your invoice ${invoice.invoiceNumber} for ${formatCurrency(
      invoice.total,
      invoice.currency
    )}.\n\nYou can view and download it here:\n${shareUrl}\n\nThank you for your business,\n${invoice.sender.name}`
  );
  const emailUrl = `mailto:${encodeURIComponent(invoice.customer.email || "")}?subject=${emailSubject}&body=${emailBody}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `${shareText}\n\nView invoice: ${shareUrl}`
  )}`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/45 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-zinc-200/90 overflow-hidden transform transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="share-dialog-title"
                className="text-sm font-bold text-zinc-900 tracking-tight"
              >
                Share Invoice
              </h2>
              <p className="text-[11px] text-zinc-500 font-mono">
                {invoice.invoiceNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Public Link Control Card */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/70 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {isEnabled ? (
                  <Globe className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Lock className="w-4 h-4 text-zinc-400" />
                )}
                <span className="text-xs font-semibold text-zinc-900">
                  {isEnabled ? "Public Link is Active" : "Public Link is Disabled"}
                </span>
              </div>
              <Button
                variant={isEnabled ? "secondary" : "primary"}
                size="sm"
                onClick={handleToggleShare}
                isLoading={isToggling}
                className="text-xs"
              >
                {isEnabled ? "Revoke Link" : "Enable Public Link"}
              </Button>
            </div>

            {isEnabled ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full text-xs font-mono bg-white border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 select-all focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopy}
                    className="shrink-0 gap-1"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-600" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Anyone with this unguessable link can view this invoice.</span>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-zinc-900 hover:underline font-medium"
                  >
                    <span>Preview</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Enable public sharing to generate a secure, unguessable link for your client.
                You can revoke access anytime.
              </p>
            )}
          </div>

          {/* Sharing Channels */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Share Options
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Native Device Share */}
              {canNativeShare && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-left transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-900">
                      Device Share
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      AirDrop, Apps, Nearby
                    </div>
                  </div>
                </button>
              )}

              {/* Email */}
              <a
                href={emailUrl}
                className={`flex items-center gap-3 p-3 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-left transition-colors ${
                  !isEnabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={(e) => {
                  if (!isEnabled) {
                    e.preventDefault();
                    alert("Please enable the public link first so your client can view the invoice.");
                  }
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900">Email</div>
                  <div className="text-[10px] text-zinc-500">
                    Send to {invoice.customer.name || "Client"}
                  </div>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href={isEnabled ? whatsappUrl : "#"}
                target={isEnabled ? "_blank" : undefined}
                rel="noreferrer"
                className={`flex items-center gap-3 p-3 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-left transition-colors ${
                  !isEnabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={(e) => {
                  if (!isEnabled) {
                    e.preventDefault();
                    alert("Please enable the public link first so your client can view the invoice.");
                  }
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900">WhatsApp</div>
                  <div className="text-[10px] text-zinc-500">Share directly in chat</div>
                </div>
              </a>

              {/* LinkedIn */}
              <a
                href={isEnabled ? linkedinUrl : "#"}
                target={isEnabled ? "_blank" : undefined}
                rel="noreferrer"
                className={`flex items-center gap-3 p-3 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-left transition-colors ${
                  !isEnabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={(e) => {
                  if (!isEnabled) {
                    e.preventDefault();
                    alert("Please enable the public link first so your client can view the invoice.");
                  }
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                  <LinkedinIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900">LinkedIn</div>
                  <div className="text-[10px] text-zinc-500">Post or message</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-50/70 border-t border-zinc-100 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
