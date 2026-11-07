import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

interface SeoProps {
  title?: string;
}

export const Seo: FC<SeoProps> = (props) => {
  const { title } = props;

  const fullTitle = title ? title + ' | T3 Vakfı Mülakat Sistemi' : 'T3 Vakfı Mülakat Sistemi';

  return (
    <Helmet>
      <title>{fullTitle}</title>
    </Helmet>
  );
};

Seo.propTypes = {
  title: PropTypes.string,
};
