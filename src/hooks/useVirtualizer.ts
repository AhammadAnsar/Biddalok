import { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from 'react';

export interface VirtualItem {
  index: number;
  start: number;
  size: number;
  end: number;
}

export interface UseVirtualizerOptions {
  count: number;
  estimateSize: number | ((index: number) => number);
  overscan?: number;
  getScrollElement: () => HTMLElement | null;
}

export interface VirtualizerResult {
  virtualItems: VirtualItem[];
  totalHeight: number;
  paddingTop: number;
  paddingBottom: number;
  startIndex: number;
  endIndex: number;
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
  scrollToOffset: (offset: number, behavior?: ScrollBehavior) => void;
  isScrolling: boolean;
}

/**
 * High-performance, lightweight virtualization hook for React 19+.
 * Maintains 60 FPS scrolling with tens of thousands of items without freezing the browser.
 */
export function useVirtualizer({
  count,
  estimateSize,
  overscan = 8,
  getScrollElement,
}: UseVirtualizerOptions): VirtualizerResult {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const getSize = useCallback(
    (index: number): number => {
      if (typeof estimateSize === 'function') {
        return estimateSize(index);
      }
      return estimateSize;
    },
    [estimateSize]
  );

  // Measure scroll element size & bind passive scroll listener
  useEffect(() => {
    const element = getScrollElement();
    if (!element) return;

    // Initial measurement
    setViewportHeight(element.clientHeight || 600);
    setScrollTop(element.scrollTop);

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const currentTop = element.scrollTop;
        setScrollTop(currentTop);

        setIsScrolling(true);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 150);
      });
    };

    element.addEventListener('scroll', handleScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === element) {
            setViewportHeight(element.clientHeight || 600);
          }
        }
      });
      resizeObserver.observe(element);
    }

    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (resizeObserver) resizeObserver.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [getScrollElement]);

  // Total height calculation & index boundaries
  const { totalHeight, itemOffsets } = useMemo(() => {
    const offsets: number[] = new Array(count);
    let currentOffset = 0;

    for (let i = 0; i < count; i++) {
      offsets[i] = currentOffset;
      currentOffset += getSize(i);
    }

    return { totalHeight: currentOffset, itemOffsets: offsets };
  }, [count, getSize]);

  // Binary search to quickly find the first visible index
  const findStartIndex = useCallback(
    (targetTop: number): number => {
      if (count === 0) return 0;
      let low = 0;
      let high = count - 1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const offset = itemOffsets[mid];
        const size = getSize(mid);

        if (offset + size > targetTop) {
          if (mid === 0 || itemOffsets[mid - 1] + getSize(mid - 1) <= targetTop) {
            return mid;
          }
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }
      return 0;
    },
    [count, itemOffsets, getSize]
  );

  // Compute virtual item range
  const { virtualItems, paddingTop, paddingBottom, startIndex, endIndex } = useMemo(() => {
    if (count === 0) {
      return {
        virtualItems: [],
        paddingTop: 0,
        paddingBottom: 0,
        startIndex: 0,
        endIndex: 0,
      };
    }

    const rawStartIndex = findStartIndex(scrollTop);
    const startIdx = Math.max(0, rawStartIndex - overscan);

    let endIdx = rawStartIndex;
    const viewBottom = scrollTop + viewportHeight;

    while (endIdx < count - 1) {
      const offset = itemOffsets[endIdx];
      if (offset > viewBottom) break;
      endIdx++;
    }

    endIdx = Math.min(count - 1, endIdx + overscan);

    const items: VirtualItem[] = [];
    for (let i = startIdx; i <= endIdx; i++) {
      const start = itemOffsets[i];
      const size = getSize(i);
      items.push({
        index: i,
        start,
        size,
        end: start + size,
      });
    }

    const padTop = itemOffsets[startIdx] || 0;
    const lastItemEnd = items.length > 0 ? items[items.length - 1].end : 0;
    const padBottom = Math.max(0, totalHeight - lastItemEnd);

    return {
      virtualItems: items,
      paddingTop: padTop,
      paddingBottom: padBottom,
      startIndex: startIdx,
      endIndex: endIdx,
    };
  }, [count, scrollTop, viewportHeight, overscan, itemOffsets, getSize, totalHeight, findStartIndex]);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      const element = getScrollElement();
      if (!element || index < 0 || index >= count) return;
      const targetOffset = itemOffsets[index] || 0;
      element.scrollTo({
        top: targetOffset,
        behavior,
      });
    },
    [count, getScrollElement, itemOffsets]
  );

  const scrollToOffset = useCallback(
    (offset: number, behavior: ScrollBehavior = 'smooth') => {
      const element = getScrollElement();
      if (!element) return;
      element.scrollTo({
        top: offset,
        behavior,
      });
    },
    [getScrollElement]
  );

  return {
    virtualItems,
    totalHeight,
    paddingTop,
    paddingBottom,
    startIndex,
    endIndex,
    scrollToIndex,
    scrollToOffset,
    isScrolling,
  };
}
