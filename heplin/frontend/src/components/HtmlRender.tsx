import parse, {
  domToReact,
  attributesToProps,
  Element,
  HTMLReactParserOptions,
} from 'html-react-parser';
import xss from 'xss';

const options: HTMLReactParserOptions = {
  replace: (domNode) => {
    const typedDomNode = domNode as Element;

    if (typedDomNode.attribs && typedDomNode.name === 'a') {
      return (
        <a
          {...attributesToProps(typedDomNode.attribs)}
          //className="underline text-primary-500"
          target="_blank"
        >
          {typedDomNode.children && domToReact(typedDomNode.children, options)}
        </a>
      );
    }

    return false;
  },
};

const HTMLRender = ({ html }: { html: string }) => {
  return <>{parse(xss(html), options)}</>;
};

HTMLRender.displayName = 'HTMLRender';

export default HTMLRender;
