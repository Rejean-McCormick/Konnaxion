'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Form, Input, Button, Upload, message } from 'antd';
import type { UploadChangeParam, UploadFile } from 'antd/es/upload/interface';
import type { RcFile } from 'antd/es/upload';
import Map, { Marker, MapRef, ViewState, MapLayerMouseEvent } from 'react-map-gl';

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

/** Normalise l’événement Upload → fileList (AntD v4). */
function normFile(e: UploadChangeParam<UploadFile>): UploadFile[] {
  return e?.fileList ?? [];
}

/** Transforme un UploadFile → File (si présent). */
function toFile(uploadFile?: UploadFile): File | undefined {
  const f = uploadFile?.originFileObj as RcFile | undefined;
  return f as unknown as File | undefined;
}

export default function SculptureEdit({ sculpture, onSubmit }: SculptureEditProps) {
  const [form] = Form.useForm();
  const mapRef = useRef<MapRef | null>(null);

  const initialViewState = useMemo<ViewState>(() => ({
    longitude: sculpture.location?.lng ?? 0,
    latitude: sculpture.location?.lat ?? 0,
    zoom: 12,
  }), [sculpture.location?.lat, sculpture.location?.lng]);

  const [viewState, setViewState] = useState<ViewState>(initialViewState);

  const flyTo = useCallback((lat: number, lng: number) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 12, duration: 1200 });
  }, []);

  const onMapClick = useCallback((e: MapLayerMouseEvent) => {
    const { lat, lng } = e.lngLat;
    form.setFieldsValue({ location: { lat, lng } });
    setViewState((vs) => ({ ...vs, latitude: lat, longitude: lng }));
  }, [form]);

  const onFinish = useCallback(async (values: any) => {
    try {
      // NOTE: values a la forme { title, description, location: {lat,lng}, image?: UploadFile[] }
      const file = toFile(values.image?.[0]);
      let imageUrl = sculpture.imageUrl;

      // TODO: uploader le fichier si présent et récupérer un URL
      // if (file) {
      //   const uploadedUrl = await uploadImageToYourAPI(file);
      //   imageUrl = uploadedUrl;
      // }

      const updated: Sculpture = {
        ...sculpture,
        title: values.title,
        description: values.description,
        location: { lat: values.location?.lat, lng: values.location?.lng },
        imageUrl,
      };

      await onSubmit(updated);
      message.success('Sculpture mise à jour');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      message.error("Échec de l'enregistrement");
    }
  }, [onSubmit, sculpture]);

  const onFinishFailed = useCallback(() => {
    message.warning('Merci de corriger les champs requis.');
  }, []);

  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr', maxWidth: 900 }}>
      <Form
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

        {/* Coordonnées (lat/lng) synchronisées avec la carte */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            label="Latitude"
            name={['location', 'lat']}
            rules={[{ required: true, message: 'Latitude requise.' }]}
          >
            <Input type="number" step="0.000001" onBlur={() => {
              const { location } = form.getFieldsValue();
              if (location?.lat != null && location?.lng != null) {
                flyTo(Number(location.lat), Number(location.lng));
              }
            }} />
          </Form.Item>
          <Form.Item
            label="Longitude"
            name={['location', 'lng']}
            rules={[{ required: true, message: 'Longitude requise.' }]}
          >
            <Input type="number" step="0.000001" onBlur={() => {
              const { location } = form.getFieldsValue();
              if (location?.lat != null && location?.lng != null) {
                flyTo(Number(location.lat), Number(location.lng));
              }
            }} />
          </Form.Item>
        </div>

        {/* Upload de l’image (optionnel). Laisse la TODO pour brancher ton backend. */}
        <Form.Item label="Image" name="image" valuePropName="fileList" getValueFromEvent={normFile}>
          <Upload beforeUpload={() => false} listType="picture-card" maxCount={1}>
            <div>Choisir une image</div>
          </Upload>
        </Form.Item>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" htmlType="submit">Enregistrer</Button>
          <Button
            onClick={() => flyTo(
              form.getFieldValue(['location', 'lat']),
              form.getFieldValue(['location', 'lng']),
            )}
          >
            Recentrer la carte
          </Button>
        </div>
      </Form>

      {/* Carte : React Map GL (v7/8). Si tu es sur MapLibre, change l’import à `react-map-gl/maplibre`. */}
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
