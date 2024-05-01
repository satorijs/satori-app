import React, {
    createContext,
    useCallback,
    useContext,
    useRef,
    type ForwardRefRenderFunction,
    useImperativeHandle,
  } from 'react';
  import {
    type CellRendererProps,
    FlatList,
    type FlatListProps,
    type LayoutChangeEvent,
    type LayoutRectangle,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    View,
  } from 'react-native';
  
  export interface VisibilityAwareFlatListProps<T = unknown>
    extends FlatListProps<T> {
    onViewportItemsChanged?: (items: VisibleItem[]) => void;
    viewportItemsChangePercentage?: number;
    triggerOnLayoutChange?: boolean;
    nestedViewportKey?: string;
    as?: any;
  }
  
  export type VisibleItem = {
    index: number;
    percentage: number;
    parents?: (string | undefined)[];
    top: number;
  };
  
  const NestedContext = createContext<(string | undefined)[]>([]);
  
  const VisibilityAwareFlatListComponent: ForwardRefRenderFunction<
    FlatList<unknown>,
    VisibilityAwareFlatListProps<unknown>
  > = <T,>(
    {
      as: Component = FlatList,
      onLayout,
      onContentSizeChange,
      onViewportItemsChanged,
      triggerOnLayoutChange,
      viewportItemsChangePercentage,
      onScroll,
      horizontal,
      nestedViewportKey,
      ...rest
    }: VisibilityAwareFlatListProps<T>,
    ref: React.ForwardedRef<FlatList<T>>
  ) => {
    const flatListLayout = useRef<LayoutRectangle | null>(null);
    const itemPositions = useRef<{ [key: number]: LayoutRectangle }>({});
    const parentValue = useContext(NestedContext);
  
    // @ts-ignore
    useImperativeHandle(ref, () => ({
      getCurrentVisibleItems: () => {
        return calculateLayout(
          flatListLayout?.current?.[horizontal ? 'x' : 'y'] ?? 0
        );
      },
    }));
  
    const renderCell = useCallback(
      ({
        children,
        onLayout: cellLayout,
        index,
        ...cellRest
      }: CellRendererProps<T>) => {
        return (
          <View
            {...cellRest}
            onLayout={(e) => {
              cellLayout?.(e);
              itemPositions.current[index] = e.nativeEvent.layout;
            }}
          >
            {children}
          </View>
        );
      },
      []
    );
  
    const calculateLayout = useCallback(
      (offset: number) => {
        const visibleItems: VisibleItem[] = [];
        const dimension = horizontal ? 'width' : 'height';
        const axis = horizontal ? 'x' : 'y';
  
        Object.entries(itemPositions.current).forEach(([index, value]: any) => {
          if (flatListLayout.current) {
            const scrollSize = offset + flatListLayout.current?.[dimension];
            if (
              offset + flatListLayout.current?.[dimension] > value[axis] &&
              offset < value[axis] + value[dimension]
            ) {
              let percentage = 0;
  
              if (
                scrollSize >= value[axis] &&
                scrollSize <= value[axis] + value[dimension]
              ) {
                // item will become visible partly
                percentage = (scrollSize - value[axis]) / value[dimension];
              } else if (
                scrollSize >= value[axis] &&
                scrollSize >= value[axis] + value[dimension] &&
                offset <= value[axis]
              ) {
                // item fully visible in the viewport
                percentage = 1;
              } else if (
                scrollSize >= value[axis] &&
                scrollSize >= value[axis] + value[dimension] &&
                offset >= value[axis]
              ) {
                // item will disappear after scroll
                percentage =
                  (value[dimension] - (offset - value[axis])) / value[dimension];
              }
  
              if (percentage >= (viewportItemsChangePercentage ?? 0)) {
                
                const item: VisibleItem = {
                  index: index,
                  percentage: percentage,
                  top: offset + value[axis] - flatListLayout.current[axis],
                };
  
                const parents = [...parentValue]?.concat(nestedViewportKey);
  
                if (nestedViewportKey) {
                  item.parents = parents.slice(1, parents.length);
                }
  
                visibleItems.push(item);
              }
            }
          }
        });
  
        return visibleItems;
      },
      [horizontal, nestedViewportKey, parentValue, viewportItemsChangePercentage]
    );
  
    const triggerCalculation = useCallback(
      (offset: number) => {
        if (onViewportItemsChanged) {
          onViewportItemsChanged(calculateLayout(offset));
        }
      },
      [onViewportItemsChanged, calculateLayout]
    );
  
    const handleOnScroll = useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        triggerCalculation(e.nativeEvent.contentOffset[horizontal ? 'x' : 'y']);
        onScroll?.(e);
      },
      [triggerCalculation, horizontal, onScroll]
    );
  
    const handleOnLayout = useCallback(
      (e: LayoutChangeEvent) => {
        flatListLayout.current = e.nativeEvent.layout;
        onLayout?.(e);
        if (triggerOnLayoutChange) {
          triggerCalculation(
            flatListLayout?.current?.[horizontal ? 'x' : 'y'] ?? 0
          );
        }
      },
      [horizontal, onLayout, triggerCalculation, triggerOnLayoutChange]
    );
  
    const handleOnContentSizeChange = useCallback(
      (w: number, h: number) => {
        onContentSizeChange?.(w, h);
        if (triggerOnLayoutChange) {
          triggerCalculation(
            flatListLayout?.current?.[horizontal ? 'x' : 'y'] ?? 0
          );
        }
      },
      [horizontal, onContentSizeChange, triggerCalculation, triggerOnLayoutChange]
    );
  
    return (
      <NestedContext.Provider
        value={[...parentValue]?.concat(
          Array.isArray(nestedViewportKey)
            ? nestedViewportKey
            : [nestedViewportKey]
        )}
      >
        <Component
          {...rest}
          ref={ref}
          onLayout={handleOnLayout}
          onContentSizeChange={handleOnContentSizeChange}
          CellRendererComponent={renderCell}
          onScroll={handleOnScroll}
          horizontal={horizontal}
        />
      </NestedContext.Provider>
    );
  };
  
  const VisibilityAwareFlatList = React.forwardRef(
    VisibilityAwareFlatListComponent
  ) as <T = unknown>(
    props: VisibilityAwareFlatListProps<T> & { ref?: any }, // dont know what to do :D
    ref: React.ForwardedRef<FlatList<T>>
  ) => React.ReactElement;
  
  export type VisibilityAwareFlatListRef = FlatList & {
    getCurrentVisibleItems(): VisibleItem[];
  };
  
  export default VisibilityAwareFlatList;