"use client";
import { useUpdateEffect } from "react-use";
import { useMemo, useState } from "react";
import classNames from "classnames";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { GridPattern } from "@/components/magic-ui/grid-pattern";
import { htmlTagToText } from "@/lib/html-tag-to-text";

export const Preview = ({
  html,
  isResizing,
  isAiWorking,
  ref,
  device,
  currentTab,
  iframeRef,
  isEditableModeEnabled,
  onClickElement,
}: {
  html: string;
  isResizing: boolean;
  isAiWorking: boolean;
  ref: React.RefObject<HTMLDivElement | null>;
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
  device: "desktop" | "mobile";
  currentTab: string;
  isEditableModeEnabled?: boolean;
  onClickElement?: (element: HTMLElement) => void;
}) => {
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(
    null
  );

  // add event listener to the iframe to track hovered elements
  const handleMouseOver = (event: MouseEvent) => {
    if (iframeRef?.current) {
      const iframeDocument = iframeRef.current.contentDocument;
      if (iframeDocument) {
        const targetElement = event.target as HTMLElement;
        if (
          hoveredElement !== targetElement &&
          targetElement !== iframeDocument.body
        ) {
          setHoveredElement(targetElement);
          targetElement.classList.add("hovered-element");
        } else {
          return setHoveredElement(null);
        }
      }
    }
  };
  const handleMouseOut = () => {
    setHoveredElement(null);
  };
  const handleClick = (event: MouseEvent) => {
    if (iframeRef?.current) {
      const iframeDocument = iframeRef.current.contentDocument;
      if (iframeDocument) {
        const targetElement = event.target as HTMLElement;
        if (targetElement !== iframeDocument.body) {
          onClickElement?.(targetElement);
        }
      }
    }
  };

  useUpdateEffect(() => {
    const cleanupListeners = () => {
      if (iframeRef?.current?.contentDocument) {
        const iframeDocument = iframeRef.current.contentDocument;
        iframeDocument.removeEventListener("mouseover", handleMouseOver);
        iframeDocument.removeEventListener("mouseout", handleMouseOut);
        iframeDocument.removeEventListener("click", handleClick);
      }
    };

    if (iframeRef?.current) {
      const iframeDocument = iframeRef.current.contentDocument;
      if (iframeDocument) {
        // Clean up existing listeners first
        cleanupListeners();

        if (isEditableModeEnabled) {
          iframeDocument.addEventListener("mouseover", handleMouseOver);
          iframeDocument.addEventListener("mouseout", handleMouseOut);
          iframeDocument.addEventListener("click", handleClick);
        }
      }
    }

    // Clean up when component unmounts or dependencies change
    return cleanupListeners;
  }, [iframeRef, isEditableModeEnabled]);

  const selectedElement = useMemo(() => {
    if (!isEditableModeEnabled) return null;
    if (!hoveredElement) return null;
    return hoveredElement;
  }, [hoveredElement, isEditableModeEnabled]);

  return (
    <div
      ref={ref}
      className={classNames(
        "w-full border-l border-gray-900 h-full relative z-0 flex items-center justify-center",
        {
          "lg:p-4": currentTab !== "preview",
          "max-lg:h-0": currentTab === "chat",
          "max-lg:h-full": currentTab === "preview",
        }
      )}
      onClick={(e) => {
        if (isAiWorking) {
          e.preventDefault();
          e.stopPropagation();
          toast.warning("Please wait for the AI to finish working.");
        }
      }}
    >
      <GridPattern
        x={-1}
        y={-1}
        strokeDasharray={"4 2"}
        className={cn(
          "[mask-image:radial-gradient(900px_circle_at_center,white,transparent)]"
        )}
      />
      {!isAiWorking && hoveredElement && selectedElement && (
        <div
          className="cursor-pointer absolute bg-sky-500/10 border-[2px] border-dashed border-sky-500 p-3 z-10 pointer-events-none"
          style={{
            top:
              selectedElement.getBoundingClientRect().top +
              (currentTab === "preview" ? 0 : 24),
            left:
              selectedElement.getBoundingClientRect().left +
              (currentTab === "preview" ? 0 : 24),
            width: selectedElement.getBoundingClientRect().width,
            height: selectedElement.getBoundingClientRect().height,
          }}
        >
          <span className="bg-sky-500 text-sm text-neutral-100 px-2 py-0.5 -translate-y-7 absolute top-0 left-0">
            {htmlTagToText(selectedElement.tagName.toLowerCase())}
          </span>
        </div>
      )}
      {device === "mobile" ? (
        <div
          style={{
            width: 320,
            height: 684,
            border: "16px solid #222",
            borderRadius: 40,
            boxShadow: "0 8px 40px #0008",
            position: "relative",
            background: "#111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 10,
              left: "50%",
              transform: "translateX(-50%)",
              width: 60,
              height: 5,
              background: "#444",
              borderRadius: 5,
              zIndex: 3,
            }}
          />
          <iframe
            id="preview-iframe"
            ref={iframeRef}
            title="output"
            className={classNames(
              "w-full h-full select-none transition-all duration-200 bg-black",
              {
                "pointer-events-none": isResizing || isAiWorking,
                "rounded-[32px]": false,
              }
            )}
            style={{
              border: "none",
              width: 288,
              height: 608,
              borderRadius: 28,
              marginTop: 24,
              marginBottom: 24,
              background: "#000",
            }}
            srcDoc={html}
            onLoad={() => {
              if (iframeRef?.current?.contentWindow?.document?.body) {
                iframeRef.current.contentWindow.document.body.scrollIntoView({
                  block: isAiWorking ? "end" : "start",
                  inline: "nearest",
                  behavior: isAiWorking ? "instant" : "smooth",
                });
              }
            }}
          />
        </div>
      ) : (
        <iframe
          id="preview-iframe"
          ref={iframeRef}
          title="output"
          className={classNames(
            "w-full select-none transition-all duration-200 bg-black h-full",
            {
              "pointer-events-none": isResizing || isAiWorking,
              "lg:border-[8px] lg:border-neutral-700 lg:shadow-2xl":
                currentTab !== "preview" && device === "desktop",
            }
          )}
          srcDoc={html}
          onLoad={() => {
            if (iframeRef?.current?.contentWindow?.document?.body) {
              iframeRef.current.contentWindow.document.body.scrollIntoView({
                block: isAiWorking ? "end" : "start",
                inline: "nearest",
                behavior: isAiWorking ? "instant" : "smooth",
              });
            }
          }}
        />
      )}
    </div>
  );
};
