import { JSX, FC, useCallback } from "react";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { template } from "../../styles/template";

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
        borderTopLeftRadius: template.borderRadius.screen,
        borderTopRightRadius: template.borderRadius.screen,
        overflow: "hidden",
      }}
    >
      {children}
    </BottomSheet>
  );
};
