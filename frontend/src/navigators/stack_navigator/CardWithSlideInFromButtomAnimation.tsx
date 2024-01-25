import { JSX, FC, useCallback, useRef } from "react";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";

export const CardWithSlideInFromBotomAnimation: FC<{
  goBack: () => void;
  children: JSX.Element;
}> = ({ goBack, children }) => {
  const handleOnClose = useCallback(goBack, []);

  const renderBackdrop = useCallback((props: any) => {
    return (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
      />
    );
  }, []);

  return (
    <BottomSheet
      snapPoints={["100%"]}
      enablePanDownToClose={true}
      onClose={handleOnClose}
      backdropComponent={renderBackdrop}
      handleStyle={{ display: "none" }}
      style={{
        borderTopLeftRadius: 7,
        borderTopRightRadius: 7,
        overflow: "hidden",
      }}
    >
      {children}
    </BottomSheet>
  );
};
