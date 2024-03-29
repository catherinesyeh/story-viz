import { useEffect, useState } from "react";

function Image({ ...props }) {
  const [src, setSrc] = useState(props.href);

  // Effect to update src when props.href changes
  useEffect(() => {
    setSrc(props.href);
  }, [props.href]);

  const handleError = () => {
    setSrc(props.placeholder);
  };

  return <image {...props} href={src} onError={handleError} />;
}

export default Image;
