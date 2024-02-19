import { FC, useCallback, useRef, useEffect, ReactNode } from "react";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { template } from "../../styles/template";
import { GoBackContext } from "../../components/context/GoBackContext";

export const CardWithSlideInFromBotomAnimation: FC<{
  goBack: () => void;
  children: ReactNode;
  relativeIndex: number;
}> = ({ goBack, children, relativeIndex }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (relativeIndex === 0) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [relativeIndex]);

  const handleOnClose = useCallback(goBack, []);

  const customGoBack = useCallback(() => {
    bottomSheetRef.current?.close();
  }, [bottomSheetRef.current]);

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
      ref={bottomSheetRef}
      enablePanDownToClose={true}
      onClose={handleOnClose}
      backdropComponent={renderBackdrop}
      handleStyle={{ display: "none" }}
      style={{
        borderTopLeftRadius: template.borderRadius.screen,
        borderTopRightRadius: template.borderRadius.screen,
        overflow: "hidden",
      }}
    >
      <GoBackContext.Provider value={customGoBack}>
        {children}
      </GoBackContext.Provider>
    </BottomSheet>
  );
};
