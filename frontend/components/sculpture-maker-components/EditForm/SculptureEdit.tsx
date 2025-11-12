// C:\MyCode\Konnaxionv14\frontend\components\sculpture-maker-components\EditForm\SculptureEdit.tsx
'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Form, Input, Button, Upload, message } from 'antd';
import type { RcFile, UploadChangeParam, UploadFile } from 'antd/es/upload/interface';
import Map, { Marker, MapRef, MapLayerMouseEvent } from 'react-map-gl';
import type { ViewState } from 'react-map-gl';

const { TextArea } = Input;

export interface Sculpture {
  id: string;
  title: string;
  description: string;
  location: { lat: number; lng: number };
  imageUrl?: string;
}

export interface SculptureEditProps {
  sculpture: Sculpture;
  /** Soumission des données modifiées. Branche ici ta persistance. */
  onSubmit: (updated: Sculpture) => Promise<void>;
}

/** Normalise l’événement Upload → fileList (AntD v4/5). */
function normFile(e: UploadChangeParam<UploadFile>): UploadFile[] {
  return e?.fileList ?? [];
}

/** Transforme un UploadFile → File (si présent). */
function toFile(uploadFile?: UploadFile): File | undefined {
  const f = uploadFile?.originFileObj as RcFile | undefined;
  return f as unknown as File | undefined;
}

type FormValues = {
  title: string;
  description: string;
  location?: { lat: number; lng: number };
  image?: UploadFile[];
};

export default function SculptureEdit({ sculpture, onSubmit }: SculptureEditProps) {
  const [form] = Form.useForm<FormValues>();
  const mapRef = useRef<MapRef | null>(null);

  // Ne pas typer initialViewState en ViewState (PaddingOptions, etc.) → Partial<ViewState>.
  const initialViewState = useMemo<Partial<ViewState>>(
    () => ({
      longitude: sculpture.location?.lng ?? 0,
      latitude: sculpture.location?.lat ?? 0,
      zoom: 12,
    }),
    [sculpture.location?.lat, sculpture.location?.lng],
  );

  // État contrôlé complet. padding doit être un objet PaddingOptions.
  const [viewState, setViewState] = useState<ViewState>(() => ({
    longitude: sculpture.location?.lng ?? 0,
    latitude: sculpture.location?.lat ?? 0,
    zoom: 12,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  }));

  const flyTo = useCallback((lat: number, lng: number) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 12, duration: 1200 });
  }, []);

  const onMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const { lat, lng } = e.lngLat;
      form.setFieldsValue({ location: { lat, lng } });
      setViewState((vs) => ({ ...vs, latitude: lat, longitude: lng }));
    },
    [form],
  );

  const onFinish = useCallback(
    async (values: FormValues) => {
      try {
        const file = toFile(values.image?.[0]);
        let imageUrl = sculpture.imageUrl;

        // TODO: uploader `file` vers votre backend si présent, puis affecter imageUrl.

        const updated: Sculpture = {
          ...sculpture, // correction de l’ancienne faute de frappe
          title: values.title,
          description: values.description,
          location: {
            lat: Number(values.location?.lat),
            lng: Number(values.location?.lng),
          },
          imageUrl,
        };

        await onSubmit(updated);
        message.success('Sculpture mise à jour');
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        message.error("Échec de l'enregistrement");
      }
    },
    [onSubmit, sculpture],
  );

  const onFinishFailed = useCallback(() => {
    message.warning('Merci de corriger les champs requis.');
  }, []);

  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr', maxWidth: 900 }}>
      <Form<FormValues>
        form={form}
        layout="vertical"
        initialValues={{
          title: sculpture.title,
          description: sculpture.description,
          location: {
            lat: sculpture.location?.lat,
            lng: sculpture.location?.lng,
          },
          image: [] as UploadFile[],
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Titre"
          name="title"
          rules={[{ required: true, message: 'Veuillez saisir un titre.' }]}
        >
          <Input placeholder="Titre de la sculpture" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Veuillez saisir une description.' }]}
        >
          <TextArea rows={4} placeholder="Décrivez la sculpture…" />
        </Form.Item>

        {/* Coordonnées synchronisées avec la carte */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            label="Latitude"
            name={['location', 'lat']}
            rules={[{ required: true, message: 'Latitude requise.' }]}
          >
            <Input
              type="number"
              step="0.000001"
              onBlur={() => {
                const { location } = form.getFieldsValue();
                if (location?.lat != null && location?.lng != null) {
                  flyTo(Number(location.lat), Number(location.lng));
                }
              }}
            />
          </Form.Item>
          <Form.Item
            label="Longitude"
            name={['location', 'lng']}
            rules={[{ required: true, message: 'Longitude requise.' }]}
          >
            <Input
              type="number"
              step="0.000001"
              onBlur={() => {
                const { location } = form.getFieldsValue();
                if (location?.lat != null && location?.lng != null) {
                  flyTo(Number(location.lat), Number(location.lng));
                }
              }}
            />
          </Form.Item>
        </div>

        {/* Upload image (optionnel) */}
        <Form.Item label="Image" name="image" valuePropName="fileList" getValueFromEvent={normFile}>
          <Upload beforeUpload={() => false} listType="picture-card" maxCount={1}>
            <div>Choisir une image</div>
          </Upload>
        </Form.Item>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" htmlType="submit">
            Enregistrer
          </Button>
          <Button
            onClick={() =>
              flyTo(
                Number(form.getFieldValue(['location', 'lat'])),
                Number(form.getFieldValue(['location', 'lng'])),
              )
            }
          >
            Recentrer la carte
          </Button>
        </div>
      </Form>

      {/* Carte */}
      <div style={{ height: 360 }}>
        <Map
          ref={mapRef}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          initialViewState={initialViewState}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          onClick={onMapClick}
          style={{ width: '100%', height: '100%' }}
        >
          <Marker latitude={viewState.latitude} longitude={viewState.longitude} />
        </Map>
      </div>
    </div>
  );
}
