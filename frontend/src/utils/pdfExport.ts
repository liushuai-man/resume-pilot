import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToPdf = async (
  element: HTMLElement,
  filename: string
): Promise<void> => {
  try {
    const originalTransform = element.style.transform;
    const originalTransformOrigin = element.style.transformOrigin;

    element.style.transform = 'scale(1)';
    element.style.transformOrigin = 'top center';

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    element.style.transform = originalTransform;
    element.style.transformOrigin = originalTransformOrigin;

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('PDF导出失败:', error);
    throw new Error('PDF导出失败，请稍后重试');
  }
};
