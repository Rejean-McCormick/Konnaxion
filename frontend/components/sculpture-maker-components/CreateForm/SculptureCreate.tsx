'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Row, message as antdMessage } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { Map } from '../../map-components'; // wrapper local; on ne dépend plus de FlyToInterpolator ici
import Loading from '../../Loading';
import api from '../../../shared/api';
import { normalizeError } from '../../../shared/errors';
import {
  ColStyled,
  Container,
  FormCol,
  MapCol,
  MapWrapper,
  Title,
  Wrapper,
} from '../style';
import TextFields from './CreateFormTextFields';

type ErrState = { message: string; statusCode?: number } | null;

type ViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
};

type MarkerState = {
  longitude?: number;
  latitude?: number;
};

type SculptureCreateProps = {
  setStep: (updater: number | ((n: number) => number)) => void;
  setSculpture: (data: any) => void;
  initialData?: Record<string, unknown>;
};

const DEFAULT_VIEW: ViewState = {
  longitude: -73.5673,
  latitude: 45.5017,
  zoom: 1,
  pitch: 0,
};

const SculptureCreate: React.FC<SculptureCreateProps> = ({
  setStep,
  setSculpture,
  initialData,
}) => {
  const [form] = Form.useForm();
  const [view, setView] = useState<ViewState>(DEFAULT_VIEW);
  const [marker, setMarker] = useState<MarkerState>({});
  const [makerList, setMakerList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<ErrState>(null);

  // Exemple de chargement (si présent dans l’original)
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        // ... éventuels chargements (makers, catégories, etc.)
        // const { data } = await api.get('/makers');
        // if (mounted) setMakerList(data);
      } catch (e: any) {
        const { message, statusCode } = normalizeError(e);
        if (mounted) setError({ message, statusCode });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  const addMaker = useCallback((m: any) => {
    setMakerList((prev) => [...prev, m]);
  }, []);

  const updateMapTo = useCallback(
    (lng: number, lat: number, zoom = 14) => {
      // Remplace l’ancien FlyToInterpolator : on se contente de mettre à jour l’état
      setMarker({ longitude: lng, latitude: lat });
      setView((v) => ({
        ...v,
        longitude: lng,
        latitude: lat,
        zoom: Math.max(v.zoom, zoom),
      }));
      form.setFieldsValue({ longitude: lng, latitude: lat });
    },
    [form]
  );

  const handleMapClick = useCallback(
    (lng: number, lat: number) => updateMapTo(lng, lat),
    [updateMapTo]
  );

  const handleShowOnMap = useCallback(() => {
    const { longitude, latitude } = form.getFieldsValue([
      'longitude',
      'latitude',
    ]) as { longitude?: number; latitude?: number };

    if (
      typeof longitude === 'number' &&
      !Number.isNaN(longitude) &&
      typeof latitude === 'number' &&
      !Number.isNaN(latitude)
    ) {
      updateMapTo(longitude, latitude);
    } else {
      antdMessage.info('Veuillez saisir une longitude et une latitude valides.');
    }
  }, [form, updateMapTo]);

  const coerceNumbersIn = (vals: Record<string, any>) => {
    // Aligne avec l’intention de l’original (conversion lat/lng notamment)
    ['longitude', 'latitude', 'height', 'width', 'depth'].forEach((k) => {
      if (vals[k] !== undefined && vals[k] !== null && vals[k] !== '') {
        const n = Number(vals[k]);
        if (!Number.isNaN(n)) vals[k] = n;
      }
    });
  };

  const handleFinish = async (values: any) => {
    coerceNumbersIn(values);

    setSubmitting(true);
    setError(null);

    try {
      // L’original postait sur /sculpture avec les valeurs du formulaire
      const { data } = await api.post('/sculpture', values);
      setSculpture(data);
      setStep((n) => n + 1);
      antdMessage.success('Sculpture enregistrée.');
    } catch (e: any) {
      const { message, statusCode } = normalizeError(e);
      setError({ message, statusCode });
      antdMessage.error(message || "Échec de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Wrapper>
      <Title>Créer une sculpture</Title>

      {error && (
        <Alert
          type="error"
          showIcon
          message={error.message}
          style={{ marginBottom: 16 }}
        />
      )}

      <Container>
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          initialValues={initialData}
          onFinish={handleFinish}
        >
          <Row gutter={24}>
            <ColStyled xs={24} md={12}>
              {/* ⚠️ TextFields doit être migré pour utiliser <Form.Item name="...">.
                  On lui passe désormais "form" au lieu de getFieldDecorator. */}
              <TextFields
                form={form as FormInstance}
                initialData={initialData}
                makerList={makerList}
                addMaker={addMaker}
              />

              <FormCol xs={24}>
                <Button onClick={handleShowOnMap}>Afficher sur la carte</Button>
              </FormCol>
            </ColStyled>

            <MapCol xs={24} md={12}>
              <MapWrapper>
                <Map
                  view={view}
                  marker={marker}
                  onViewChange={setView}
                  onClick={(lng: number, lat: number) => handleMapClick(lng, lat)}
                />
              </MapWrapper>
            </MapCol>
          </Row>

          <Row>
            <Col xs={24}>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Enregistrer et continuer
              </Button>
            </Col>
          </Row>
        </Form>
      </Container>
    </Wrapper>
  );
};

export default SculptureCreate;
