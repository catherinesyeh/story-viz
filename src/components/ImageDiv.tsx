import { useEffect, useState } from "react";

function Image({ ...props }) {
  const [src, setSrc] = useState(props.src);

  // Effect to update src when props.href changes
  useEffect(() => {
    setSrc(props.src);
  }, [props.src]);

  const handleError = () => {
    setSrc(props.placeholder);
  };

  return <img {...props} src={src} onError={handleError} />;
}

export default Image;
